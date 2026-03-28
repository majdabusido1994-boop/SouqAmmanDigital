import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { shopsAPI, productsAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import ShopCard from '../../components/ShopCard';
import { navigateToShop, navigateToProduct } from '../../utils/shopRouter';
import { useLanguage } from '../../i18n/LanguageContext';

const AMMAN_NEIGHBORHOODS = [
  { name: 'Abdoun', icon: 'business' },
  { name: 'Jabal Amman', icon: 'trail-sign' },
  { name: 'Rainbow Street', icon: 'color-palette' },
  { name: 'Sweifieh', icon: 'cart' },
  { name: 'Abdali', icon: 'storefront' },
  { name: 'Shmeisani', icon: 'briefcase' },
  { name: 'Al-Weibdeh', icon: 'cafe' },
  { name: 'Jubeiha', icon: 'school' },
  { name: 'Dahiyat al-Rashid', icon: 'home' },
  { name: 'Tabarbour', icon: 'people' },
  { name: 'Marj al-Hamam', icon: 'leaf' },
];

export default function NearMeScreen({ navigation }) {
  const { t } = useLanguage();
  const [selectedArea, setSelectedArea] = useState(null);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('shops');

  const loadByNeighborhood = async (neighborhood) => {
    setSelectedArea(neighborhood);
    setLoading(true);
    try {
      const [shopsRes, productsRes] = await Promise.all([
        shopsAPI.getAll({ neighborhood }),
        productsAPI.getAll({ neighborhood }),
      ]);
      setShops(shopsRes.data.shops);
      setProducts(productsRes.data.products);
    } catch (error) {
      console.error('Near me error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="location" size={24} color={colors.terracotta} />
          <Text style={styles.title}>{t('nearMe')}</Text>
        </View>
        <Text style={styles.subtitle}>{t('discoverShops')}</Text>
      </View>

      {/* Neighborhood Grid */}
      {!selectedArea && (
        <FlatList
          data={AMMAN_NEIGHBORHOODS}
          keyExtractor={(item) => item.name}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.areaCard}
              onPress={() => loadByNeighborhood(item.name)}
              activeOpacity={0.8}
            >
              <View style={styles.areaIconWrap}>
                <Ionicons name={item.icon} size={24} color={colors.terracotta} />
              </View>
              <Text style={styles.areaName}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Results */}
      {selectedArea && (
        <View style={styles.results}>
          {/* Area header */}
          <View style={styles.areaHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setSelectedArea(null)}
            >
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.areaInfo}>
              <Text style={styles.areaTitle}>{selectedArea}</Text>
              <Text style={styles.areaCount}>
                {shops.length} {t('shops')} · {products.length} {t('products')}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'shops' && styles.tabActive]}
              onPress={() => setTab('shops')}
            >
              <Ionicons
                name="storefront"
                size={16}
                color={tab === 'shops' ? colors.white : colors.textLight}
              />
              <Text style={[styles.tabText, tab === 'shops' && styles.tabTextActive]}>{t('shops')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'products' && styles.tabActive]}
              onPress={() => setTab('products')}
            >
              <Ionicons
                name="pricetag"
                size={16}
                color={tab === 'products' ? colors.white : colors.textLight}
              />
              <Text style={[styles.tabText, tab === 'products' && styles.tabTextActive]}>{t('products')}</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.terracotta} />
            </View>
          ) : tab === 'shops' ? (
            <FlatList
              data={shops}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <ShopCard
                  shop={item}
                  onPress={() => navigateToShop(navigation, item)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="storefront-outline" size={40} color={colors.textLight} />
                  <Text style={styles.emptyText}>{t('noShopsInArea')}</Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => navigateToProduct(navigation, item)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="pricetag-outline" size={40} color={colors.textLight} />
                  <Text style={styles.emptyText}>{t('noProductsInArea')}</Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  grid: {
    padding: spacing.lg,
  },
  gridRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  areaCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  areaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.terracotta + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  results: {
    flex: 1,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  areaInfo: {
    flex: 1,
  },
  areaTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  areaCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.beige,
    borderRadius: borderRadius.full,
    padding: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  tabActive: {
    backgroundColor: colors.terracotta,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textLight,
  },
  tabTextActive: {
    color: colors.white,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  productRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
  },
});
