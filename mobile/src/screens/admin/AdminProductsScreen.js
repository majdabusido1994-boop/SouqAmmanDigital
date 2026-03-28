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

export default function AdminProductsScreen({ navigation }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await adminAPI.getProducts(params);
      setProducts(data.products);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailable = async (product) => {
    try {
      const { data } = await adminAPI.toggleProductAvailable(product._id);
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isAvailable: data.isAvailable } : p))
      );
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const confirmDelete = (product) => {
    const doDelete = async () => {
      try {
        await adminAPI.deleteProduct(product._id);
        setProducts((prev) => prev.filter((p) => p._id !== product._id));
      } catch (error) {
        const msg = error.message || 'Failed to delete';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete product "${product.name}"?`)) doDelete();
    } else {
      Alert.alert(t('deleteProduct'), `Delete "${product.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: t('deleteProduct'), style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        placeholderTextColor={colors.textLight}
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.terracotta} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {item.images?.[0] ? (
                  <Image source={{ uri: getImageUrl(item.images[0]) }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <Ionicons name="image-outline" size={20} color={colors.textLight} />
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.productMeta}>
                    {item.price} JOD · {item.shop?.name || 'No shop'}
                  </Text>
                  <Text style={styles.productSeller}>
                    by {item.seller?.name || 'Unknown'}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: item.isAvailable ? colors.success : colors.error }]} />
                    <Text style={styles.statusText}>{item.isAvailable ? 'Available' : 'Hidden'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('EditProduct', { productId: item._id })}
                >
                  <Ionicons name="create-outline" size={16} color={colors.olive} />
                  <Text style={styles.actionText}>{t('edit')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleAvailable(item)}>
                  <Ionicons name={item.isAvailable ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.golden} />
                  <Text style={styles.actionText}>{item.isAvailable ? t('hide') : t('show')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => confirmDelete(item)}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('noProducts')}</Text>
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
  thumb: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
  },
  thumbPlaceholder: {
    backgroundColor: colors.beige,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  productMeta: {
    ...typography.bodySmall,
    color: colors.terracotta,
    fontWeight: '500',
    marginTop: 2,
  },
  productSeller: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 1,
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
