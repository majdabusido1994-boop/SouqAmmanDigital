import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { productsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SizeSelector from '../../components/fashion/SizeSelector';
import AnimatedLikeButton from '../../components/shared/AnimatedLikeButton';
import AnimatedButton from '../../components/shared/AnimatedButton';
import MakeOfferModal from '../../components/shared/MakeOfferModal';
import { messagesAPI } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const { width } = Dimensions.get('window');

export default function FashionProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data } = await productsAPI.getById(productId);
      setProduct(data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleOffer = async ({ offerAmount, message }) => {
    try {
      await messagesAPI.send(product.seller._id, {
        text: message,
        productId: product._id,
        messageType: 'offer',
        offerAmount,
      });
      setShowOfferModal(false);
      navigation.navigate('Chat', {
        userId: product.seller._id,
        userName: product.seller.name,
      });
    } catch (error) {
      console.error('Offer error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.fashionGold} />
      </View>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images.map(getImageUrl)
    : ['https://via.placeholder.com/400x600/F5E6D3/C4763B?text=Fashion'];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery - Full bleed */}
        <View style={styles.imageSection}>
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

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {activeImage + 1}/{images.length}
            </Text>
          </View>

          {/* Like Button */}
          <AnimatedLikeButton
            productId={product._id}
            size={26}
            style={styles.likeButton}
          />

          {/* New Drop Badge */}
          {product.isNewDrop && (
            <View style={styles.dropBadge}>
              <Text style={styles.dropBadgeText}>NEW DROP</Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.details}>
          {/* Price & Name */}
          <Text style={styles.price}>{product.price} JOD</Text>
          <Text style={styles.name}>{product.name}</Text>

          {/* Shop Link */}
          <TouchableOpacity
            style={styles.shopRow}
            onPress={() => navigation.navigate('FashionShop', { shopId: product.shop._id })}
          >
            <Text style={styles.shopLabel}>by </Text>
            <Text style={styles.shopName}>{product.shop?.name}</Text>
            {product.shop?.instagramHandle && (
              <Text style={styles.igHandle}> {product.shop.instagramHandle}</Text>
            )}
          </TouchableOpacity>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Size & Fit */}
          <SizeSelector
            sizes={product.sizes || ['S', 'M', 'L']}
            fitType={product.fitType || 'regular'}
            modelInfo={product.modelInfo || {
              size: 'M',
              height: "175cm",
              measurements: '86-66-92',
            }}
            onSelect={setSelectedSize}
          />

          {/* Style Suggestion */}
          {product.styleWith && product.styleWith.length > 0 && (
            <View style={styles.styleSection}>
              <Text style={styles.styleSectionTitle}>STYLE THIS WITH</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.styleRow}>
                  {product.styleWith.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.styleItem}
                      onPress={() => navigation.navigate('FashionProduct', { productId: item._id })}
                    >
                      <Image source={{ uri: item.image }} style={styles.styleImage} />
                      <Text style={styles.styleItemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.styleItemPrice}>{item.price} JOD</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Tags */}
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
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <AnimatedButton
          onPress={() =>
            navigation.navigate('Chat', {
              userId: product.seller._id,
              userName: product.seller.name,
              productId: product._id,
            })
          }
          style={styles.askFitButton}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.askFitText}>Ask about fit</Text>
        </AnimatedButton>

        <AnimatedButton
          onPress={() => setShowOfferModal(true)}
          style={styles.offerButton}
        >
          <Text style={styles.offerButtonText}>Make an Offer</Text>
        </AnimatedButton>

        <AnimatedButton
          onPress={() =>
            navigation.navigate('Chat', {
              userId: product.seller._id,
              userName: product.seller.name,
              productId: product._id,
            })
          }
          style={styles.messageButton}
        >
          <Ionicons name="chatbubble" size={18} color={colors.white} />
        </AnimatedButton>
      </View>

      <MakeOfferModal
        visible={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={handleOffer}
        product={product}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fashionCream,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fashionCream,
  },
  imageSection: {
    position: 'relative',
  },
  image: {
    width,
    height: width * 1.3,
  },
  imageCounter: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  imageCounterText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
    fontSize: 11,
  },
  likeButton: {
    position: 'absolute',
    top: spacing.xxl,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
  },
  dropBadge: {
    position: 'absolute',
    top: spacing.xxl,
    left: spacing.md,
    backgroundColor: colors.fashionGold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  dropBadgeText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.fashionBlack,
    letterSpacing: 2,
  },
  details: {
    padding: spacing.lg,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.terracotta,
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.editorial,
    color: colors.textPrimary,
    fontSize: 26,
    letterSpacing: 0,
    fontWeight: '400',
    marginBottom: spacing.sm,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  shopLabel: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  shopName: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
    textDecorationLine: 'underline',
  },
  igHandle: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  styleSection: {
    marginBottom: spacing.lg,
  },
  styleSectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  styleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  styleItem: {
    width: 120,
  },
  styleImage: {
    width: 120,
    height: 160,
    borderRadius: borderRadius.md,
    backgroundColor: colors.beige,
    marginBottom: spacing.xs,
  },
  styleItemName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  styleItemPrice: {
    ...typography.bodySmall,
    color: colors.terracotta,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.beige,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  // Action Bar
  actionBar: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    alignItems: 'center',
  },
  askFitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.beigeLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  askFitText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  offerButton: {
    flex: 1,
    backgroundColor: colors.terracotta,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
  },
  offerButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.fashionBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
