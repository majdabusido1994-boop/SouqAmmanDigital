import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function DailySpecial({ item, onPress }) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.foodWarm + '40', colors.foodWarm],
  });

  const imageUri = item?.images?.[0] || 'https://via.placeholder.com/400x200/FFF3E6/B85C38?text=Today+Special';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Animated.View style={[styles.container, { borderColor }]}>
        {/* Badge */}
        <View style={styles.badge}>
          <Ionicons name="flame" size={14} color={colors.white} />
          <Text style={styles.badgeText}>TODAY'S SPECIAL</Text>
        </View>

        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

        <View style={styles.content}>
          <Text style={styles.name}>{item?.name || "Chef's Special"}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item?.description || 'Ask about today\'s freshly prepared special'}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.price}>{item?.price || '?'} JOD</Text>
            {item?.prepTime && (
              <View style={styles.info}>
                <Ionicons name="time-outline" size={14} color={colors.foodHerb} />
                <Text style={styles.infoText}>{item.prepTime}</Text>
              </View>
            )}
            <View style={styles.orderBtn}>
              <Text style={styles.orderText}>Order</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.white} />
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    ...shadows.md,
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.foodWarm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    letterSpacing: 1,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.foodCream,
  },
  content: {
    padding: spacing.md,
  },
  name: {
    ...typography.menuTitle,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foodWarm,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.foodHerb,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.foodWarm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  orderText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.white,
  },
});
