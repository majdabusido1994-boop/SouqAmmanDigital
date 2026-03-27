import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { shopsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MenuCard from '../../components/food/MenuCard';
import DailySpecial from '../../components/food/DailySpecial';
import VerifiedBadge from '../../components/shared/VerifiedBadge';
import AnimatedButton from '../../components/shared/AnimatedButton';
import { getImageUrl } from '../../utils/imageUrl';

export default function FoodShopScreen({ route, navigation }) {
  const { shopId } = route.params;
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchShop();
  }, [shopId]);

  const fetchShop = async () => {
    try {
      const { data } = await shopsAPI.getById(shopId);
      setShop(data.shop);
      setProducts(data.products);
      setIsFollowing(data.shop.followers?.includes(user?.id));
    } catch (error) {
      console.error('Shop fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const { data } = await shopsAPI.follow(shopId);
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.foodWarm} />
      </View>
    );
  }

  if (!shop) return null;

  // Group by category for menu sections
  const menuCategories = {};
  products.forEach((p) => {
    const cat = p.menuCategory || p.category || 'Other';
    if (!menuCategories[cat]) menuCategories[cat] = [];
    menuCategories[cat].push(p);
  });

  const sections = Object.entries(menuCategories).map(([title, data]) => ({
    title: title.charAt(0).toUpperCase() + title.slice(1).replace('-', ' '),
    data,
  }));

  const todaySpecial = products.find((p) => p.isTodaySpecial);
  const deliveryInfo = shop.deliveryInfo || { delivery: true, pickup: true };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Cover with warm overlay */}
      <View style={styles.coverContainer}>
        {shop.coverImage ? (
          <Image source={{ uri: getImageUrl(shop.coverImage) }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]} />
        )}
        <View style={styles.coverOverlay} />

        {/* Shop Info overlay */}
        <View style={styles.coverContent}>
          <View style={styles.avatarWrap}>
            {shop.profileImage ? (
              <Image source={{ uri: getImageUrl(shop.profileImage) }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{shop.name.charAt(0)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.shopName}>{shop.name}</Text>
          {shop.isVerified && <VerifiedBadge size="small" />}
        </View>

        <Text style={styles.description}>{shop.description}</Text>

        {/* Delivery/Pickup Info */}
        <View style={styles.deliveryRow}>
          {deliveryInfo.delivery && (
            <View style={styles.deliveryTag}>
              <Ionicons name="bicycle-outline" size={14} color={colors.foodHerb} />
              <Text style={styles.deliveryText}>Delivery</Text>
            </View>
          )}
          {deliveryInfo.pickup && (
            <View style={styles.deliveryTag}>
              <Ionicons name="bag-handle-outline" size={14} color={colors.foodHerb} />
              <Text style={styles.deliveryText}>Pickup</Text>
            </View>
          )}
          {shop.neighborhood && (
            <View style={styles.deliveryTag}>
              <Ionicons name="location-outline" size={14} color={colors.foodWarm} />
              <Text style={[styles.deliveryText, { color: colors.foodWarm }]}>
                {shop.neighborhood}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <AnimatedButton
            onPress={handleFollow}
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
          >
            <Ionicons
              name={isFollowing ? 'heart' : 'heart-outline'}
              size={16}
              color={isFollowing ? colors.foodWarm : colors.white}
            />
            <Text style={[styles.followText, isFollowing && styles.followingText]}>
              {isFollowing ? 'Saved' : 'Save'}
            </Text>
          </AnimatedButton>

          {shop.whatsappNumber && (
            <AnimatedButton
              onPress={() => Linking.openURL(`https://wa.me/${shop.whatsappNumber}`)}
              style={styles.waButton}
            >
              <Ionicons name="logo-whatsapp" size={18} color={colors.success} />
              <Text style={styles.waText}>Order via WhatsApp</Text>
            </AnimatedButton>
          )}
        </View>
      </View>

      {/* Today's Special */}
      {todaySpecial && (
        <View style={styles.specialSection}>
          <DailySpecial
            item={todaySpecial}
            onPress={() => navigation.navigate('FoodProduct', { productId: todaySpecial._id })}
          />
        </View>
      )}

      {/* Menu Header */}
      <View style={styles.menuHeader}>
        <Ionicons name="restaurant" size={18} color={colors.foodWarm} />
        <Text style={styles.menuTitle}>MENU</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length} items</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <MenuCard
            item={item}
            onPress={() => navigation.navigate('FoodProduct', { productId: item._id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Menu coming soon</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.foodCream,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.foodCream,
  },
  header: {},
  coverContainer: {
    height: 200,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: colors.foodWarm,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(184, 92, 56, 0.3)',
  },
  coverContent: {
    position: 'absolute',
    bottom: -40,
    left: spacing.lg,
  },
  avatarWrap: {
    borderRadius: 44,
    padding: 3,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: colors.foodWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  info: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  shopName: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  deliveryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  deliveryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deliveryText: {
    ...typography.bodySmall,
    color: colors.foodHerb,
    fontWeight: '500',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.foodWarm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  followingBtn: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.foodWarm,
  },
  followText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  followingText: {
    color: colors.foodWarm,
  },
  waButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  waText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  specialSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  menuTitle: {
    ...typography.caption,
    color: colors.foodWarm,
    letterSpacing: 3,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.foodCream,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionCount: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
  },
});
