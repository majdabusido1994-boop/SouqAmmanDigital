import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../i18n/LanguageContext';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F5A623', icon: 'time-outline' },
  confirmed: { label: 'Confirmed', color: colors.info, icon: 'checkmark-circle-outline' },
  preparing: { label: 'Preparing', color: colors.olive, icon: 'construct-outline' },
  ready: { label: 'Ready', color: colors.success, icon: 'bag-check-outline' },
  delivered: { label: 'Delivered', color: colors.success, icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', color: colors.error, icon: 'close-circle-outline' },
};

export default function OrdersScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('buyer'); // buyer | seller

  const isSeller = user?.role === 'seller' || user?.role === 'superadmin';

  useEffect(() => {
    fetchOrders();
  }, [tab]);

  const fetchOrders = async () => {
    try {
      const { data } = await ordersAPI.getAll(tab);
      setOrders(data);
    } catch (error) {
      console.error('Orders error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = (order, newStatus) => {
    const config = STATUS_CONFIG[newStatus];
    const doUpdate = async () => {
      try {
        await ordersAPI.updateStatus(order._id, { status: newStatus });
        fetchOrders();
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert(error.message);
        } else {
          Alert.alert(t('error'), error.message);
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`${t('markAs')} ${t(newStatus)} - #${order._id.slice(-6)}?`)) {
        doUpdate();
      }
    } else {
      Alert.alert(
        `${t('markAs')} ${t(newStatus)}?`,
        `${t('update')} #${order._id.slice(-6)} - ${t(newStatus)}`,
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('update'), onPress: doUpdate },
        ]
      );
    }
  };

  const getNextStatus = (current) => {
    const flow = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'delivered' };
    return flow[current] || null;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderOrder = ({ item: order }) => {
    const status = STATUS_CONFIG[order.status];
    const nextStatus = tab === 'seller' ? getNextStatus(order.status) : null;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Ionicons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{t(order.status)}</Text>
          </View>
        </View>

        {/* Shop name */}
        <Text style={styles.shopLabel}>
          {tab === 'buyer' ? order.shop?.name : `From: ${order.buyer?.name}`}
        </Text>

        {/* Items */}
        {order.items?.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            {item.image ? (
              <Image source={{ uri: getImageUrl(item.image) }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                <Ionicons name="image-outline" size={14} color={colors.textLight} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price} JOD x{item.quantity}</Text>
            </View>
          </View>
        ))}

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>{t('total')}:</Text>
          <Text style={styles.totalPrice}>{order.total} JOD</Text>
        </View>

        {/* Delivery info */}
        <View style={styles.deliveryRow}>
          <Ionicons
            name={order.deliveryMethod === 'delivery' ? 'bicycle-outline' : 'location-outline'}
            size={14}
            color={colors.textLight}
          />
          <Text style={styles.deliveryText}>
            {order.deliveryMethod === 'delivery' ? t('delivery') : t('pickup')}
            {order.paymentMethod === 'cliq' ? ` - ${t('cliqPayment')}` : ` - ${t('cash')}`}
          </Text>
        </View>

        {/* Seller action: advance status */}
        {tab === 'seller' && nextStatus && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: STATUS_CONFIG[nextStatus].color }]}
            onPress={() => handleUpdateStatus(order, nextStatus)}
          >
            <Ionicons name={STATUS_CONFIG[nextStatus].icon} size={16} color={colors.white} />
            <Text style={styles.actionBtnText}>{t('markAs')} {t(nextStatus)}</Text>
          </TouchableOpacity>
        )}

        {/* Cancel button */}
        {order.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleUpdateStatus(order, 'cancelled')}
          >
            <Text style={styles.cancelBtnText}>{t('cancelOrder')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('orders')}</Text>
      </View>

      {/* Tabs */}
      {isSeller && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'buyer' && styles.tabActive]}
            onPress={() => setTab('buyer')}
          >
            <Text style={[styles.tabText, tab === 'buyer' && styles.tabTextActive]}>{t('myOrders')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'seller' && styles.tabActive]}
            onPress={() => setTab('seller')}
          >
            <Text style={[styles.tabText, tab === 'seller' && styles.tabTextActive]}>{t('received')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchOrders(); }}
            tintColor={colors.terracotta}
          />
        }
        renderItem={renderOrder}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>{t('noOrdersYet')}</Text>
            <Text style={styles.emptySubtext}>
              {tab === 'buyer'
                ? t('ordersAppearHere')
                : t('customerOrdersAppear')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.terracotta,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderId: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderDate: {
    ...typography.bodySmall,
    color: colors.textLight,
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  shopLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
  },
  itemImagePlaceholder: {
    backgroundColor: colors.beige,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  itemPrice: {
    ...typography.bodySmall,
    color: colors.textLight,
    fontSize: 11,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  totalPrice: {
    ...typography.body,
    fontWeight: '700',
    color: colors.terracotta,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  deliveryText: {
    ...typography.bodySmall,
    color: colors.textLight,
    fontSize: 11,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  actionBtnText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.white,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: spacing.xs,
    padding: spacing.xs,
  },
  cancelBtnText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
