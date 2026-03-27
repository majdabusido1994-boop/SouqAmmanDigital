import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { productsAPI } from '../../services/api';
import AnimatedLikeButton from '../../components/shared/AnimatedLikeButton';
import AnimatedButton from '../../components/shared/AnimatedButton';
import MakeOfferModal from '../../components/shared/MakeOfferModal';
import { messagesAPI } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const { width } = Dimensions.get('window');

export default function HandcraftProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data } = await productsAPI.getById(productId);
      setProduct(data);
    } catch {
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
      setShowOffer(false);
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
        <ActivityIndicator size="large" color={colors.craftClay} />
      </View>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images.map(getImageUrl)
    : ['https://via.placeholder.com/400x400/F0E4D4/8B6F4E?text=Handcraft'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Images with paper-like frame */}
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
              <View style={styles.imageFrame}>
                <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
              </View>
            )}
          />

          {images.length > 1 && (
            <View style={styles.imageIndicator}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, activeImage === i && styles.dotActive]} />
              ))}
            </View>
          )}

          <AnimatedLikeButton
            productId={product._id}
            size={24}
            style={styles.likeBtn}
          />
        </View>

        {/* Product Details - artisan layout */}
        <View style={styles.content}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price} JOD</Text>

          {/* Craft Tags */}
          <View style={styles.tagsRow}>
            {product.materials && product.materials.map((mat) => (
              <View key={mat} style={styles.matTag}>
                <Text style={styles.matTagText}>{mat}</Text>
              </View>
            ))}
            {product.isHandmade !== false && (
              <View style={[styles.matTag, styles.handmadeTag]}>
                <Ionicons name="hand-left" size={11} color={colors.craftEarth} />
                <Text style={[styles.matTagText, { color: colors.craftEarth }]}>Handmade</Text>
              </View>
            )}
            {product.isLocal && (
              <View style={[styles.matTag, styles.localTag]}>
                <Ionicons name="location" size={11} color={colors.craftClay} />
                <Text style={[styles.matTagText, { color: colors.craftClay }]}>Local</Text>
              </View>
            )}
            {product.isEco && (
              <View style={[styles.matTag, styles.ecoTag]}>
                <Ionicons name="leaf" size={11} color={colors.craftGreen} />
                <Text style={[styles.matTagText, { color: colors.craftGreen }]}>Eco</Text>
              </View>
            )}
          </View>

          {/* Story / Description */}
          <View style={styles.storySection}>
            <View style={styles.storyDivider}>
              <View style={styles.dividerLine} />
              <Ionicons name="book-outline" size={16} color={colors.craftEarth} />
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.storyLabel}>THE STORY</Text>
            <Text style={styles.storyText}>
              {product.story || product.description}
            </Text>
          </View>

          {/* How It's Made */}
          {product.process && (
            <View style={styles.processSection}>
              <Text style={styles.processTitle}>HOW IT'S MADE</Text>
              <Text style={styles.processText}>{product.process}</Text>
            </View>
          )}

          {/* Dimensions */}
          {product.dimensions && (
            <View style={styles.dimSection}>
              <Text style={styles.dimTitle}>DIMENSIONS</Text>
              <Text style={styles.dimText}>{product.dimensions}</Text>
            </View>
          )}

          {/* Shop Info */}
          <TouchableOpacity
            style={styles.shopCard}
            onPress={() => navigation.navigate('HandcraftShop', { shopId: product.shop._id })}
          >
            {product.shop?.profileImage ? (
              <Image source={{ uri: getImageUrl(product.shop.profileImage) }} style={styles.shopAvatar} />
            ) : (
              <View style={[styles.shopAvatar, styles.shopAvatarPlaceholder]}>
                <Text style={styles.shopAvatarText}>{product.shop?.name?.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{product.shop?.name}</Text>
              <Text style={styles.shopMeta}>Artisan · {product.neighborhood || 'Amman'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <AnimatedButton
          onPress={() =>
            navigation.navigate('Chat', {
              userId: product.seller._id,
              userName: product.seller.name,
              productId: product._id,
            })
          }
          style={styles.messageBtn}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.craftEarth} />
        </AnimatedButton>

        {product.acceptsOffers && (
          <AnimatedButton
            onPress={() => setShowOffer(true)}
            style={styles.offerBtn}
          >
            <Text style={styles.offerBtnText}>Make an Offer</Text>
          </AnimatedButton>
        )}

        {product.acceptsCustomOrders && (
          <AnimatedButton
            onPress={() =>
              navigation.navigate('CustomOrder', {
                shopId: product.shop._id,
                sellerId: product.seller._id,
                shopName: product.shop?.name,
                productId: product._id,
              })
            }
            style={styles.customBtn}
          >
            <Ionicons name="construct" size={16} color={colors.white} />
            <Text style={styles.customBtnText}>Custom Order</Text>
          </AnimatedButton>
        )}
      </View>

      <MakeOfferModal
        visible={showOffer}
        onClose={() => setShowOffer(false)}
        onSubmit={handleOffer}
        product={product}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.craftPaper,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.craftPaper,
  },
  imageSection: {
    position: 'relative',
    backgroundColor: colors.craftPaper,
    padding: spacing.md,
    paddingTop: spacing.xxl,
  },
  imageFrame: {
    width: width - spacing.md * 2,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.sandDark + '40',
  },
  image: {
    width: '100%',
    height: width - spacing.md * 2,
    backgroundColor: colors.beige,
  },
  imageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sandDark + '40',
  },
  dotActive: {
    backgroundColor: colors.craftEarth,
    width: 18,
  },
  likeBtn: {
    position: 'absolute',
    top: spacing.xxl + spacing.sm,
    right: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
  },
  content: {
    padding: spacing.lg,
  },
  name: {
    ...typography.artisanTitle,
    color: colors.craftEarth,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.craftClay,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  matTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.sand + '60',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.sandDark + '30',
  },
  matTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  handmadeTag: {
    backgroundColor: colors.craftEarth + '10',
    borderColor: colors.craftEarth + '25',
  },
  localTag: {
    backgroundColor: colors.craftClay + '10',
    borderColor: colors.craftClay + '25',
  },
  ecoTag: {
    backgroundColor: colors.craftGreen + '10',
    borderColor: colors.craftGreen + '25',
  },
  storySection: {
    marginBottom: spacing.lg,
  },
  storyDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.sandDark + '30',
  },
  storyLabel: {
    ...typography.caption,
    color: colors.craftEarth,
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  storyText: {
    ...typography.artisan,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  processSection: {
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.sandDark + '20',
  },
  processTitle: {
    ...typography.caption,
    color: colors.craftEarth,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  processText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  dimSection: {
    marginBottom: spacing.lg,
  },
  dimTitle: {
    ...typography.caption,
    color: colors.textLight,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  dimText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandDark + '20',
  },
  shopAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  shopAvatarPlaceholder: {
    backgroundColor: colors.craftClay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopAvatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  shopMeta: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  // Action bar
  actionBar: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.craftPaper,
    borderTopWidth: 1,
    borderTopColor: colors.sandDark + '30',
    gap: spacing.sm,
    alignItems: 'center',
  },
  messageBtn: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.craftEarth + '40',
  },
  offerBtn: {
    flex: 1,
    backgroundColor: colors.craftEarth,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  offerBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
  },
  customBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.craftClay,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  customBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
  },
});
