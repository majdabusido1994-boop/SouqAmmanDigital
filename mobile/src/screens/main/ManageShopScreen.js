import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { shopsAPI, productsAPI } from '../../services/api';
import { navigateToShop } from '../../utils/shopRouter';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ManageShopScreen({ route, navigation }) {
  const { t } = useLanguage();
  const shopId = route?.params?.shopId;
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      let data;
      if (shopId) {
        const res = await shopsAPI.getById(shopId);
        data = res.data;
      } else {
        const res = await shopsAPI.getMine();
        data = res.data;
      }
      setShop(data.shop);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Fetch shop error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      t('deleteProduct'),
      `${t('confirmDeleteProduct')} "${product.name}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await productsAPI.delete(product._id);
              setProducts((prev) => prev.filter((p) => p._id !== product._id));
            } catch (error) {
              Alert.alert(t('error'), error.message || t('failedDelete'));
            }
          },
        },
      ]
    );
  };

  const pickAndUploadImage = async (field) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: field === 'coverImage' ? [16, 9] : [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploading(field);
    try {
      const formData = new FormData();
      const uri = result.assets[0].uri;
      formData.append('image', {
        uri,
        name: `${field}-${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
      formData.append('field', field);

      const { data } = await shopsAPI.uploadImage(shop._id, formData);
      setShop((prev) => ({ ...prev, [field]: data.url }));
      Alert.alert(t('successMsg'), field === 'profileImage' ? t('logoUploaded') : t('coverUploaded'));
    } catch (error) {
      Alert.alert(t('error'), t('failedUpload'));
      console.error('Upload error:', error);
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.centered}>
        <Ionicons name="storefront-outline" size={48} color={colors.textLight} />
        <Text style={styles.emptyText}>{t('noShopFound')}</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateShop')}
        >
          <Text style={styles.createBtnText}>{t('createShop')}</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cover Image */}
      <TouchableOpacity
        style={styles.coverContainer}
        onPress={() => pickAndUploadImage('coverImage')}
      >
        {shop.coverImage ? (
          <Image source={{ uri: getImageUrl(shop.coverImage) }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder]}>
            <Ionicons name="image-outline" size={32} color={colors.white} />
            <Text style={styles.placeholderText}>{t('tapToAddCover')}</Text>
          </View>
        )}
        {uploading === 'coverImage' && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator color={colors.white} />
          </View>
        )}
        <View style={styles.coverBadge}>
          <Ionicons name="camera" size={14} color={colors.white} />
        </View>
      </TouchableOpacity>

      {/* Logo / Profile Image */}
      <View style={styles.logoSection}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => pickAndUploadImage('profileImage')}
        >
          {shop.profileImage ? (
            <Image source={{ uri: getImageUrl(shop.profileImage) }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.logoPlaceholder]}>
              <Ionicons name="storefront" size={28} color={colors.white} />
            </View>
          )}
          {uploading === 'profileImage' && (
            <View style={styles.logoUploadOverlay}>
              <ActivityIndicator color={colors.white} size="small" />
            </View>
          )}
          <View style={styles.logoBadge}>
            <Ionicons name="camera" size={10} color={colors.white} />
          </View>
        </TouchableOpacity>

        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopCategory}>{shop.category}</Text>
          <Text style={styles.shopNeighborhood}>{shop.neighborhood}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.olive + '15' }]}>
            <Ionicons name="add-circle" size={24} color={colors.olive} />
          </View>
          <Text style={styles.actionTitle}>{t('addProduct')}</Text>
          <Text style={styles.actionSubtitle}>{t('listNewItem')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigateToShop(navigation, shop)}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.terracotta + '15' }]}>
            <Ionicons name="eye" size={24} color={colors.terracotta} />
          </View>
          <Text style={styles.actionTitle}>{t('viewShop')}</Text>
          <Text style={styles.actionSubtitle}>{t('seePublicView')}</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{`${t('myProductsCount')} (${products.length})`}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
            <Ionicons name="add" size={24} color={colors.terracotta} />
          </TouchableOpacity>
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyProducts}>
            <Ionicons name="pricetag-outline" size={36} color={colors.textLight} />
            <Text style={styles.emptyProductsText}>{t('noProductsYet')}</Text>
            <TouchableOpacity
              style={styles.addFirstBtn}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <Text style={styles.addFirstBtnText}>{t('addFirstProduct')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          products.map((product) => (
            <View key={product._id} style={styles.productRow}>
              <TouchableOpacity
                style={styles.productMain}
                onPress={() => navigation.navigate('EditProduct', { productId: product._id })}
              >
                {product.images?.[0] ? (
                  <Image source={{ uri: getImageUrl(product.images[0]) }} style={styles.productThumb} />
                ) : (
                  <View style={[styles.productThumb, styles.productThumbPlaceholder]}>
                    <Ionicons name="image-outline" size={16} color={colors.textLight} />
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.price} JOD</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('EditProduct', { productId: product._id })}
                >
                  <Ionicons name="create-outline" size={18} color={colors.olive} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteProduct(product)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
  },
  createBtn: {
    backgroundColor: colors.terracotta,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  createBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  coverContainer: {
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.bodySmall,
    color: colors.white,
    marginTop: spacing.xs,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: -30,
    gap: spacing.md,
  },
  logoContainer: {
    position: 'relative',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.white,
  },
  logoPlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoUploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.terracotta,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopInfo: {
    flex: 1,
    paddingTop: 30,
  },
  shopName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  shopCategory: {
    ...typography.bodySmall,
    color: colors.terracotta,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  shopNeighborhood: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionSubtitle: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: 2,
  },
  productsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  emptyProductsText: {
    ...typography.body,
    color: colors.textLight,
  },
  addFirstBtn: {
    backgroundColor: colors.terracotta,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  addFirstBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  productMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  productActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.olive + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productThumb: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
  },
  productThumbPlaceholder: {
    backgroundColor: colors.beige,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  productPrice: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.terracotta,
    marginTop: 2,
  },
});
