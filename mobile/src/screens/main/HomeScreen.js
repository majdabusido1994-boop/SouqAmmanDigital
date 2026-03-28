import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  Image,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useLanguage } from '../../i18n/LanguageContext';
import { shopsAPI } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import { navigateToShop } from '../../utils/shopRouter';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

const CATEGORIES = [
  { key: '', labelKey: 'all', icon: 'grid-outline' },
  { key: 'fashion', labelKey: 'fashion', icon: 'shirt-outline' },
  { key: 'accessories', labelKey: 'accessories', icon: 'watch-outline' },
  { key: 'home-decor', labelKey: 'homeDecor', icon: 'home-outline' },
  { key: 'food', labelKey: 'food', icon: 'restaurant-outline' },
  { key: 'art', labelKey: 'art', icon: 'color-palette-outline' },
  { key: 'handmade', labelKey: 'handmade', icon: 'hand-left-outline' },
  { key: 'beauty', labelKey: 'beauty', icon: 'flower-outline' },
  { key: 'services', labelKey: 'services', icon: 'construct-outline' },
];

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.labelKey])
);

function ShopCardLarge({ shop, onPress, t }) {
  return (
    <TouchableOpacity style={styles.shopCard} onPress={onPress} activeOpacity={0.9}>
      {shop.profileImage ? (
        <Image source={{ uri: getImageUrl(shop.profileImage) }} style={styles.shopImage} />
      ) : (
        <View style={[styles.shopImage, styles.shopImagePlaceholder]}>
          <Text style={styles.shopImageText}>{shop.name?.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.shopInfo}>
        <View style={styles.shopHeader}>
          <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
          {shop.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {t(CATEGORY_LABELS[shop.category]) || shop.category}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.shopDescription} numberOfLines={2}>{shop.description}</Text>
        <View style={styles.shopMeta}>
          {shop.neighborhood && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={colors.terracotta} />
              <Text style={styles.metaText}>{shop.neighborhood}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={colors.terracotta} />
            <Text style={styles.metaText}>{shop.followers?.length || 0} {t('followers')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HorizontalShopCard({ shop, onPress }) {
  return (
    <TouchableOpacity style={styles.hCard} onPress={onPress} activeOpacity={0.9}>
      {shop.profileImage ? (
        <Image source={{ uri: getImageUrl(shop.profileImage) }} style={styles.hCardImage} />
      ) : (
        <View style={[styles.hCardImage, styles.shopImagePlaceholder]}>
          <Text style={styles.hCardInitial}>{shop.name?.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.hCardOverlay}>
        <Text style={styles.hCardName} numberOfLines={1}>{shop.name}</Text>
        {shop.neighborhood && (
          <View style={styles.hCardLocation}>
            <Ionicons name="location" size={11} color={colors.white} />
            <Text style={styles.hCardLocationText}>{shop.neighborhood}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage();
  const [shops, setShops] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShops = useCallback(async (cat = category) => {
    try {
      const params = {};
      if (cat) params.category = cat;
      const { data } = await shopsAPI.getAll(params);
      setShops(data.shops || data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    setLoading(true);
    fetchShops(category);
  }, [category]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShops();
  };

  const groupedShops = () => {
    const groups = {};
    shops.forEach((shop) => {
      const cat = shop.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(shop);
    });
    return Object.entries(groups).map(([key, data]) => ({
      title: t(CATEGORY_LABELS[key]) || key.charAt(0).toUpperCase() + key.slice(1),
      data: [{ key, shops: data }],
    }));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleBar}>
        <View>
          <Text style={styles.title}>{t('souqAmman')}</Text>
          <Text style={styles.titleAccent}>{t('digital')}</Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={22} color={colors.terracotta} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, category === item.key && styles.categoryActive]}
            onPress={() => setCategory(item.key)}
          >
            <Ionicons
              name={item.icon}
              size={16}
              color={category === item.key ? colors.white : colors.terracotta}
            />
            <Text
              style={[
                styles.categoryText,
                category === item.key && styles.categoryTextActive,
              ]}
            >
              {t(item.labelKey)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  if (loading && shops.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  // Filtered category view — show shops as vertical list
  if (category) {
    return (
      <View style={styles.container}>
        <FlatList
          data={shops}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <ShopCardLarge
              shop={item}
              onPress={() => navigateToShop(navigation, item)}
              t={t}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terracotta} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="storefront-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>{t('noShopsCategory')}</Text>
            </View>
          }
        />
      </View>
    );
  }

  // "All" view — show shops grouped by category in horizontal rows
  const sections = groupedShops();

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.key + index}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <TouchableOpacity onPress={() => setCategory(
              CATEGORIES.find((c) => t(c.labelKey) === section.title)?.key || ''
            )}>
              <Text style={styles.seeAll}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={item.shops}
            keyExtractor={(shop) => shop._id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item: shop }) => (
              <HorizontalShopCard
                shop={shop}
                onPress={() => navigateToShop(navigation, shop)}
              />
            )}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terracotta} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>{t('noShopsYet')}</Text>
            <Text style={styles.emptySubtext}>{t('beFirstShop')}</Text>
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
    paddingBottom: spacing.md,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  titleAccent: {
    fontSize: 14,
    fontWeight: '300',
    color: colors.terracotta,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryActive: {
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
  },
  categoryText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.white,
  },
  list: {
    paddingBottom: spacing.xxl,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.terracotta,
    fontWeight: '600',
  },

  // Horizontal shop cards (for "All" view)
  horizontalList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  hCard: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  hCardImage: {
    width: '100%',
    height: '100%',
  },
  shopImagePlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hCardInitial: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
    opacity: 0.6,
  },
  hCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(26, 18, 16, 0.6)',
  },
  hCardName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
  },
  hCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  hCardLocationText: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.85,
  },

  // Vertical shop cards (for filtered view)
  shopCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  shopImage: {
    width: '100%',
    height: 160,
  },
  shopImageText: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.white,
    opacity: 0.5,
  },
  shopInfo: {
    padding: spacing.md,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shopName: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: colors.beige,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  categoryBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.terracotta,
  },
  shopDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  shopMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textLight,
  },

  // Empty state
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
