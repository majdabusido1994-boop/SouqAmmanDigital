import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import AnimatedLikeButton from '../shared/AnimatedLikeButton';
import { createCardTap } from '../../utils/animations';
import { getImageUrl } from '../../utils/imageUrl';

const { width, height } = Dimensions.get('window');

export default function LookbookCard({ product, onPress, onShopPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    createCardTap(scaleAnim).start(() => onPress?.());
  };

  const imageUri = getImageUrl(product.images?.[0]) || 'https://via.placeholder.com/400x600/F5E6D3/C4763B?text=Fashion';

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

        {/* Gradient Overlay */}
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />

        {/* Top Bar */}
        <View style={styles.topBar}>
          {product.isNewDrop && (
            <View style={styles.dropBadge}>
              <Text style={styles.dropText}>NEW DROP</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <AnimatedLikeButton productId={product._id} size={26} style={styles.likeBtn} />
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          {/* Shop Info */}
          <TouchableWithoutFeedback onPress={onShopPress}>
            <View style={styles.shopRow}>
              {product.shop?.profileImage ? (
                <Image source={{ uri: getImageUrl(product.shop.profileImage) }} style={styles.shopAvatar} />
              ) : (
                <View style={[styles.shopAvatar, styles.shopAvatarPlaceholder]}>
                  <Text style={styles.shopAvatarText}>
                    {product.shop?.name?.charAt(0) || 'S'}
                  </Text>
                </View>
              )}
              <Text style={styles.shopName}>{product.shop?.name}</Text>
              {product.shop?.instagramHandle && (
                <View style={styles.igBadge}>
                  <Ionicons name="logo-instagram" size={12} color={colors.white} />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>

          {/* Product Info */}
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price} JOD</Text>
            {product.sizes && (
              <Text style={styles.sizes}>
                {product.sizes.join(' / ')}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    width,
    height: height * 0.85,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'transparent',
    // Simulated gradient with opacity
    borderBottomWidth: 0,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropBadge: {
    backgroundColor: colors.fashionGold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  dropText: {
    ...typography.caption,
    color: colors.fashionBlack,
    fontWeight: '800',
    letterSpacing: 2,
  },
  likeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  shopAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  shopAvatarPlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopAvatarText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  shopName: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  igBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    ...typography.editorial,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.fashionGold,
  },
  sizes: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
});
