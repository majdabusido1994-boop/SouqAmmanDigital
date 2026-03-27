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
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import AnimatedLikeButton from './shared/AnimatedLikeButton';
import { createCardTap } from '../utils/animations';
import VerifiedBadge from './shared/VerifiedBadge';

const cardWidth = (Dimensions.get('window').width - spacing.md * 3) / 2;

export default function ProductCard({ product, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    createCardTap(scaleAnim).start(() => onPress?.());
  };

  const imageUri = product.images?.[0] || 'https://via.placeholder.com/200x200/F5E6D3/C4763B?text=No+Image';

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

          <AnimatedLikeButton
            productId={product._id}
            size={18}
            style={styles.likeButton}
          />

          {product.isNewDrop && (
            <View style={styles.dropBadge}>
              <Text style={styles.dropText}>NEW</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>

          {product.shop && (
            <View style={styles.shopRow}>
              <Text style={styles.shop} numberOfLines={1}>{product.shop.name}</Text>
              {product.shop.isVerified && <VerifiedBadge size="small" />}
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price} JOD</Text>
            {product.acceptsOffers && (
              <View style={styles.offerBadge}>
                <Text style={styles.offerText}>Offers</Text>
              </View>
            )}
          </View>

          {/* Location tag */}
          {product.neighborhood && product.neighborhood !== 'Amman' && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={10} color={colors.textLight} />
              <Text style={styles.locationText}>{product.neighborhood}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: cardWidth,
    backgroundColor: colors.beige,
  },
  likeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    width: 32,
    height: 32,
  },
  dropBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.fashionGold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dropText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.fashionBlack,
    letterSpacing: 1,
  },
  info: {
    padding: spacing.sm,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  shop: {
    ...typography.bodySmall,
    color: colors.textLight,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  price: {
    ...typography.price,
    fontSize: 15,
    color: colors.terracotta,
  },
  offerBadge: {
    backgroundColor: colors.olive + '20',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  offerText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.olive,
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  locationText: {
    fontSize: 10,
    color: colors.textLight,
  },
});
