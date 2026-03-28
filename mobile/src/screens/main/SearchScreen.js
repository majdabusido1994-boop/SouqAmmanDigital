import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useLanguage } from '../../i18n/LanguageContext';
import { productsAPI, shopsAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import ShopCard from '../../components/ShopCard';
import { navigateToProduct, navigateToShop } from '../../utils/shopRouter';

const AMMAN_NEIGHBORHOODS = [
  'Abdoun', 'Jabal Amman', 'Rainbow Street', 'Sweifieh',
  'Abdali', 'Shmeisani', 'Dahiyat al-Rashid', 'Jubeiha',
  'Marj al-Hamam', 'Tabarbour', 'Al-Weibdeh',
];

export default function SearchScreen({ navigation }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('products');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const search = async () => {
    if (!query.trim() && Object.keys(filters).length === 0) return;
    setLoading(true);
    try {
      const params = { search: query, ...filters };
      if (tab === 'products') {
        const { data } = await productsAPI.getAll(params);
        setResults(data.products);
      } else {
        const { data } = await shopsAPI.getAll(params);
        setResults(data.shops);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={tab === 'products' ? t('searchProducts') : t('searchShops')}
            placeholderTextColor={colors.textLight}
            onSubmitEditing={search}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={22} color={colors.terracotta} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'products' && styles.tabActive]}
          onPress={() => { setTab('products'); setResults([]); }}
        >
          <Text style={[styles.tabText, tab === 'products' && styles.tabTextActive]}>{t('products')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'shops' && styles.tabActive]}
          onPress={() => { setTab('shops'); setResults([]); }}
        >
          <Text style={[styles.tabText, tab === 'shops' && styles.tabTextActive]}>{t('shops')}</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>{t('neighborhood')}</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={AMMAN_NEIGHBORHOODS}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterChips}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.chip, filters.neighborhood === item && styles.chipActive]}
                onPress={() =>
                  setFilters((prev) =>
                    prev.neighborhood === item
                      ? { ...prev, neighborhood: undefined }
                      : { ...prev, neighborhood: item }
                  )
                }
              >
                <Text
                  style={[styles.chipText, filters.neighborhood === item && styles.chipTextActive]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.terracotta} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          numColumns={tab === 'products' ? 2 : 1}
          key={tab}
          columnWrapperStyle={tab === 'products' ? styles.row : undefined}
          contentContainerStyle={styles.list}
          renderItem={({ item }) =>
            tab === 'products' ? (
              <ProductCard
                product={item}
                onPress={() => navigateToProduct(navigation, item)}
              />
            ) : (
              <ShopCard
                shop={item}
                onPress={() => navigateToShop(navigation, item)}
              />
            )
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>
                {query ? t('noResults') : t('searchPrompt')}
              </Text>
            </View>
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
    paddingTop: 60,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  filterChips: {
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.olive,
    borderColor: colors.olive,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
