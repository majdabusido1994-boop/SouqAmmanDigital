import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';

export default function VerifiedBadge({ size = 'small', showLabel = false }) {
  const iconSize = size === 'small' ? 14 : 18;

  return (
    <View style={[styles.container, size === 'large' && styles.containerLarge]}>
      <View style={[styles.badge, size === 'large' && styles.badgeLarge]}>
        <Ionicons name="checkmark-circle" size={iconSize} color={colors.teal} />
      </View>
      {showLabel && <Text style={styles.label}>Verified Seller</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  containerLarge: {
    backgroundColor: colors.teal + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badge: {},
  badgeLarge: {},
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.teal,
  },
});
