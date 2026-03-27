import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { createCardTap } from '../../utils/animations';
import AnimatedLikeButton from '../shared/AnimatedLikeButton';
import { getImageUrl } from '../../utils/imageUrl';

const cardWidth = Dimensions.get('window').width - spacing.lg * 2;

export default function StoryCard({ product, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    createCardTap(scaleAnim).start(() => onPress?.());
  };

  const imageUri = getImageUrl(product.images?.[0]) || 'https://via.placeholder.com/400x300/F0E4D4/8B6F4E?text=Handcraft';

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        {/* Textured paper background effect */}
        <View style={styles.paperTexture} />

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

          {/* Corner fold effect */}
          <View style={styles.cornerFold} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name}>{product.name}</Text>

          {product.story && (
            <Text style={styles.story} numberOfLines={3}>
              "{product.story}"
            </Text>
          )}

          {/* Material Tags */}
          <View style={styles.tagsRow}>
            {product.materials && product.materials.map((mat) => (
              <View key={mat} style={styles.materialTag}>
                <Text style={styles.materialText}>{mat}</Text>
              </View>
            ))}
            {product.isHandmade !== false && (
              <View style={[styles.materialTag, styles.handmadeTag]}>
                <Ionicons name="hand-left-outline" size={10} color={colors.craftEarth} />
                <Text style={[styles.materialText, styles.handmadeText]}>Handmade</Text>
              </View>
            )}
            {product.isEco && (
              <View style={[styles.materialTag, styles.ecoTag]}>
                <Ionicons name="leaf-outline" size={10} color={colors.craftGreen} />
                <Text style={[styles.materialText, styles.ecoText]}>Eco</Text>
              </View>
            )}
          </View>

          {/* Bottom */}
          <View style={styles.bottomRow}>
            <Text style={styles.price}>{product.price} JOD</Text>

            {product.acceptsCustomOrders && (
              <View style={styles.customBadge}>
                <Text style={styles.customText}>Custom orders</Text>
              </View>
            )}

            <View style={{ flex: 1 }} />

            <AnimatedLikeButton productId={product._id} size={22} />
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: colors.craftPaper,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    // Paper-like shadow
    shadowColor: '#8B6F4E',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  paperTexture: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.craftPaper,
    opacity: 0.3,
  },
  imageContainer: {
    position: 'relative',
    margin: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: colors.beige,
  },
  cornerFold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 24,
    borderLeftWidth: 24,
    borderTopColor: colors.craftPaper,
    borderLeftColor: 'transparent',
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  name: {
    ...typography.artisanTitle,
    fontSize: 20,
    color: colors.craftEarth,
    marginBottom: spacing.sm,
  },
  story: {
    ...typography.artisan,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  materialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.sand + '80',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.sandDark + '40',
  },
  materialText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  handmadeTag: {
    backgroundColor: colors.craftEarth + '12',
    borderColor: colors.craftEarth + '30',
  },
  handmadeText: {
    color: colors.craftEarth,
  },
  ecoTag: {
    backgroundColor: colors.craftGreen + '12',
    borderColor: colors.craftGreen + '30',
  },
  ecoText: {
    color: colors.craftGreen,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  price: {
    ...typography.price,
    color: colors.craftClay,
  },
  customBadge: {
    backgroundColor: colors.craftClay + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  customText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.craftClay,
    textTransform: 'uppercase',
  },
});
