import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { productsAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { navigateToProduct } from '../../utils/shopRouter';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'accessories', label: 'Accessories' },
  { key: 'home-decor', label: 'Home' },
  { key: 'food', label: 'Food' },
  { key: 'art', label: 'Art' },
  { key: 'handmade', label: 'Handmade' },
  { key: 'beauty', label: 'Beauty' },
  { key: 'services', label: 'Services' },
];

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (pageNum = 1, cat = category) => {
    try {
      const params = { page: pageNum, limit: 20 };
      if (cat) params.category = cat;

      const { data } = await productsAPI.getAll(params);

      if (pageNum === 1) {
        setProducts(data.products);
      } else {
        setProducts((prev) => [...prev, ...data.products]);
      }
      setHasMore(pageNum < data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchProducts(1, category);
  }, [category]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchProducts(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <View>
          <Text style={styles.title}>Souq Amman</Text>
          <Text style={styles.titleAccent}>Digital</Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={22} color={colors.terracotta} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
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
            <Text
              style={[
                styles.categoryText,
                category === item.key && styles.categoryTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigateToProduct(navigation, item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.terracotta}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyText}>No products yet</Text>
            <Text style={styles.emptySubtext}>Be the first to list something!</Text>
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
    shadowColor: colors.terracotta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
