import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

export default function ShopCard({ shop, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {shop.profileImage ? (
        <Image source={{ uri: shop.profileImage }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>{shop.name?.charAt(0)}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{shop.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{shop.description}</Text>

        <View style={styles.metaRow}>
          {shop.instagramHandle && (
            <View style={styles.metaItem}>
              <Ionicons name="logo-instagram" size={12} color={colors.textLight} />
              <Text style={styles.metaText}>{shop.instagramHandle}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={12} color={colors.textLight} />
            <Text style={styles.metaText}>{shop.followers?.length || 0}</Text>
          </View>
          {shop.neighborhood && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={colors.textLight} />
              <Text style={styles.metaText}>{shop.neighborhood}</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: colors.textLight,
  },
});
