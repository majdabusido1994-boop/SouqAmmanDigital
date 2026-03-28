import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { adminAPI } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../i18n/LanguageContext';

export default function AdminShopsScreen({ navigation }) {
  const { t } = useLanguage();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchShops();
  }, [search]);

  const fetchShops = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await adminAPI.getShops(params);
      setShops(data.shops);
    } catch (error) {
      console.error('Fetch shops error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (shop) => {
    try {
      const { data } = await adminAPI.verifyShop(shop._id, !shop.isVerified);
      setShops((prev) => prev.map((s) => (s._id === shop._id ? { ...s, isVerified: data.isVerified } : s)));
    } catch (error) {
      console.error('Verify error:', error);
    }
  };

  const toggleActive = async (shop) => {
    try {
      const { data } = await adminAPI.toggleShopActive(shop._id);
      setShops((prev) => prev.map((s) => (s._id === shop._id ? { ...s, isActive: data.isActive } : s)));
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  const confirmDelete = (shop) => {
    const doDelete = async () => {
      try {
        await adminAPI.deleteShop(shop._id);
        setShops((prev) => prev.filter((s) => s._id !== shop._id));
      } catch (error) {
        const msg = error.message || 'Failed to delete';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete shop "${shop.name}" and all its products?`)) doDelete();
    } else {
      Alert.alert(t('deleteShop'), `Delete "${shop.name}" and all its products?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: t('deleteShop'), style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search shops..."
        placeholderTextColor={colors.textLight}
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.terracotta} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {item.profileImage ? (
                  <Image source={{ uri: getImageUrl(item.profileImage) }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>{item.name?.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.shopInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
                    {item.isVerified && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.teal} />
                    )}
                  </View>
                  <Text style={styles.shopMeta}>
                    {item.category} · {item.owner?.name || 'Unknown owner'}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: item.isActive ? colors.success : colors.error }]} />
                    <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleVerify(item)}>
                  <Ionicons name={item.isVerified ? 'close-circle-outline' : 'checkmark-circle-outline'} size={16} color={colors.teal} />
                  <Text style={styles.actionText}>{item.isVerified ? t('unverify') : t('verify')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleActive(item)}>
                  <Ionicons name={item.isActive ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.golden} />
                  <Text style={styles.actionText}>{item.isActive ? t('deactivate') : t('activate')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => confirmDelete(item)}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('noShops')}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchInput: {
    margin: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...typography.body,
    color: colors.textPrimary,
    ...shadows.soft,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  shopInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  shopMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: colors.textLight,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.beige,
  },
  actionText: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  deleteBtn: {
    backgroundColor: colors.error + '15',
    marginLeft: 'auto',
  },
  empty: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
