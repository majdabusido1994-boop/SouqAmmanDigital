import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { productsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data } = await productsAPI.getById(productId);
      setProduct(data);
      setLiked(data.likes?.includes(user?.id));
    } catch (error) {
      Alert.alert('Error', 'Product not found');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await productsAPI.like(productId);
      setLiked(!liked);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleMessage = () => {
    if (product?.seller) {
      navigation.navigate('Chat', {
        userId: product.seller._id,
        userName: product.seller.name,
        productId: product._id,
      });
    }
  };

  const handleWhatsApp = () => {
    if (product?.shop?.whatsappNumber) {
      const msg = `Hi! I'm interested in "${product.name}" (${product.price} JOD) from SOUQ AMMAN DIGITAL`;
      const url = `https://wa.me/${product.shop.whatsappNumber}?text=${encodeURIComponent(msg)}`;
      Linking.openURL(url);
    }
  };

  const handleInstagram = () => {
    if (product?.shop?.instagramHandle) {
      const handle = product.shop.instagramHandle.replace('@', '');
      Linking.openURL(`https://instagram.com/${handle}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images.map(getImageUrl)
    : ['https://via.placeholder.com/400x400/F5E6D3/C4763B?text=No+Image'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <FlatList
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={images}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={(e) => {
            setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width));
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
          )}
        />
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, activeImage === i && styles.dotActive]} />
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? colors.error : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price} JOD</Text>
          {product.acceptsOffers && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Accepts Offers</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{product.name}</Text>

        <TouchableOpacity
          style={styles.shopRow}
          onPress={() => navigation.navigate('ShopDetail', { shopId: product.shop._id })}
        >
          {product.shop?.profileImage ? (
            <Image source={{ uri: getImageUrl(product.shop.profileImage) }} style={styles.shopAvatar} />
          ) : (
            <View style={[styles.shopAvatar, styles.shopAvatarPlaceholder]}>
              <Text style={styles.shopAvatarText}>
                {product.shop?.name?.charAt(0) || 'S'}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.shopName}>{product.shop?.name}</Text>
            {product.shop?.instagramHandle && (
              <Text style={styles.instagram}>{product.shop.instagramHandle}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        {product.neighborhood && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.olive} />
            <Text style={styles.location}>{product.neighborhood}, Amman</Text>
          </View>
        )}

        {product.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {product.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleMessage}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.white} />
          <Text style={styles.primaryButtonText}>Message Seller</Text>
        </TouchableOpacity>

        {product.acceptsOffers && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('Chat', {
                userId: product.seller._id,
                userName: product.seller.name,
                productId: product._id,
                messageType: 'offer',
              })
            }
          >
            <Ionicons name="pricetag-outline" size={20} color={colors.terracotta} />
            <Text style={styles.secondaryButtonText}>Make an Offer</Text>
          </TouchableOpacity>
        )}

        {product.acceptsCustomOrders && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('Chat', {
                userId: product.seller._id,
                userName: product.seller.name,
                productId: product._id,
                messageType: 'custom-order',
              })
            }
          >
            <Ionicons name="construct-outline" size={20} color={colors.terracotta} />
            <Text style={styles.secondaryButtonText}>Request Custom Order</Text>
          </TouchableOpacity>
        )}

        <View style={styles.socialRow}>
          {product.shop?.whatsappNumber && (
            <TouchableOpacity style={styles.socialButton} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={22} color={colors.success} />
              <Text style={styles.socialText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
          {product.shop?.instagramHandle && (
            <TouchableOpacity style={styles.socialButton} onPress={handleInstagram}>
              <Ionicons name="logo-instagram" size={22} color="#E1306C" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width,
    height: width,
  },
  dots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 24,
  },
  likeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.price,
    fontSize: 24,
    color: colors.terracotta,
  },
  badge: {
    backgroundColor: colors.olive + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.olive,
    fontSize: 10,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  shopAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  shopAvatarPlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopAvatarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  shopName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  instagram: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  location: {
    ...typography.bodySmall,
    color: colors.olive,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.sand,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: colors.terracotta,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  primaryButtonText: {
    ...typography.h3,
    color: colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.terracotta,
  },
  secondaryButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.terracotta,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
