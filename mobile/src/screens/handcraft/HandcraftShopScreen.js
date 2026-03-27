import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { shopsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StoryCard from '../../components/handcraft/StoryCard';
import VerifiedBadge from '../../components/shared/VerifiedBadge';
import AnimatedButton from '../../components/shared/AnimatedButton';
import { getImageUrl } from '../../utils/imageUrl';

export default function HandcraftShopScreen({ route, navigation }) {
  const { shopId } = route.params;
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchShop();
  }, [shopId]);

  const fetchShop = async () => {
    try {
      const { data } = await shopsAPI.getById(shopId);
      setShop(data.shop);
      setProducts(data.products);
      setIsFollowing(data.shop.followers?.includes(user?.id));
    } catch (error) {
      console.error('Shop error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const { data } = await shopsAPI.follow(shopId);
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.craftClay} />
      </View>
    );
  }

  if (!shop) return null;

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Artisan Header - textured background */}
      <View style={styles.heroSection}>
        <View style={styles.grainOverlay} />

        <View style={styles.heroContent}>
          {/* Avatar with rough border */}
          <View style={styles.avatarBorder}>
            {shop.profileImage ? (
              <Image source={{ uri: getImageUrl(shop.profileImage) }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{shop.name.charAt(0)}</Text>
              </View>
            )}
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.shopName}>{shop.name}</Text>
            {shop.isVerified && <VerifiedBadge size="small" />}
          </View>

          {shop.artisanStory && (
            <Text style={styles.artisanStory}>"{shop.artisanStory}"</Text>
          )}

          <Text style={styles.description}>{shop.description}</Text>

          {/* Craft Tags */}
          <View style={styles.craftTags}>
            <View style={styles.craftTag}>
              <Ionicons name="hand-left" size={12} color={colors.craftEarth} />
              <Text style={styles.craftTagText}>Handmade</Text>
            </View>
            <View style={styles.craftTag}>
              <Ionicons name="location" size={12} color={colors.craftEarth} />
              <Text style={styles.craftTagText}>{shop.neighborhood || 'Amman'}</Text>
            </View>
            {shop.isEco && (
              <View style={[styles.craftTag, styles.ecoTag]}>
                <Ionicons name="leaf" size={12} color={colors.craftGreen} />
                <Text style={[styles.craftTagText, { color: colors.craftGreen }]}>Eco-friendly</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{products.length}</Text>
              <Text style={styles.statLabel}>creations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{shop.followers?.length || 0}</Text>
              <Text style={styles.statLabel}>admirers</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <AnimatedButton
              onPress={handleFollow}
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
            >
              <Ionicons
                name={isFollowing ? 'heart' : 'heart-outline'}
                size={16}
                color={isFollowing ? colors.craftClay : colors.white}
              />
              <Text style={[styles.followText, isFollowing && styles.followingText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </AnimatedButton>

            <AnimatedButton
              onPress={() => navigation.navigate('CustomOrder', {
                shopId: shop._id,
                sellerId: shop.owner._id || shop.owner,
                shopName: shop.name,
              })}
              style={styles.customOrderBtn}
            >
              <Ionicons name="construct-outline" size={16} color={colors.craftEarth} />
              <Text style={styles.customOrderText}>Request Custom Order</Text>
            </AnimatedButton>
          </View>

          {/* Social Links */}
          <View style={styles.socialRow}>
            {shop.instagramHandle && (
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => {
                  const handle = shop.instagramHandle.replace('@', '');
                  Linking.openURL(`https://instagram.com/${handle}`);
                }}
              >
                <Ionicons name="logo-instagram" size={16} color={colors.craftEarth} />
                <Text style={styles.socialText}>{shop.instagramHandle}</Text>
              </TouchableOpacity>
            )}
            {shop.whatsappNumber && (
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => Linking.openURL(`https://wa.me/${shop.whatsappNumber}`)}
              >
                <Ionicons name="logo-whatsapp" size={16} color={colors.success} />
                <Text style={styles.socialText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>CREATIONS</Text>
        <View style={styles.sectionLine} />
      </View>
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <StoryCard
          product={item}
          onPress={() => navigation.navigate('HandcraftProduct', { productId: item._id })}
        />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="color-palette-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyText}>Creations coming soon</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.craftPaper,
  },
  header: {},
  heroSection: {
    backgroundColor: colors.craftPaper,
    position: 'relative',
  },
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139,111,78,0.03)',
  },
  heroContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl + 20,
    alignItems: 'center',
  },
  avatarBorder: {
    padding: 4,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.craftEarth + '40',
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarPlaceholder: {
    backgroundColor: colors.craftClay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  shopName: {
    ...typography.artisanTitle,
    color: colors.craftEarth,
  },
  artisanStory: {
    ...typography.artisan,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  craftTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  craftTag: {
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
  craftTagText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.craftEarth,
    fontWeight: '500',
  },
  ecoTag: {
    backgroundColor: colors.craftGreen + '10',
    borderColor: colors.craftGreen + '30',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNum: {
    ...typography.h2,
    color: colors.craftEarth,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.sandDark + '40',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.craftClay,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.craftClay,
  },
  followText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.white,
  },
  followingText: {
    color: colors.craftClay,
  },
  customOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.craftEarth + '40',
  },
  customOrderText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.craftEarth,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialText: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.sandDark + '40',
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.craftEarth,
    letterSpacing: 4,
  },
  list: {
    backgroundColor: colors.craftPaper,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
  },
});
