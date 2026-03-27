import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { createCardTap } from '../../utils/animations';
import AnimatedLikeButton from '../shared/AnimatedLikeButton';

export default function MenuCard({ item, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    createCardTap(scaleAnim).start(() => onPress?.());
  };

  const imageUri = item.images?.[0] || 'https://via.placeholder.com/200x200/FFF3E6/B85C38?text=Food';

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <AnimatedLikeButton productId={item._id} size={20} />
          </View>

          {item.description && (
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          )}

          <View style={styles.bottomRow}>
            <Text style={styles.price}>{item.price} JOD</Text>

            {item.prepTime && (
              <View style={styles.prepTime}>
                <Ionicons name="time-outline" size={12} color={colors.textLight} />
                <Text style={styles.prepTimeText}>{item.prepTime}</Text>
              </View>
            )}

            {!item.isAvailable && (
              <View style={styles.unavailable}>
                <Text style={styles.unavailableText}>Sold Out</Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.dietaryTags.map((tag) => (
                <View key={tag} style={styles.dietTag}>
                  <Text style={styles.dietTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  image: {
    width: 110,
    height: 130,
    backgroundColor: colors.foodCream,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    ...typography.menuTitle,
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  price: {
    ...typography.menuPrice,
    color: colors.foodWarm,
  },
  prepTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  prepTimeText: {
    ...typography.bodySmall,
    color: colors.textLight,
    fontSize: 11,
  },
  unavailable: {
    backgroundColor: colors.error + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  unavailableText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.error,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  dietTag: {
    backgroundColor: colors.foodHerb + '15',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  dietTagText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.foodHerb,
    textTransform: 'uppercase',
  },
});
