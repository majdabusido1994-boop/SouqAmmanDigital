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
import ProductCard from '../../components/ProductCard';
import { getImageUrl } from '../../utils/imageUrl';

export default function ShopDetailScreen({ route, navigation }) {
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
      console.error('Shop fetch error:', error);
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
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  if (!shop) return null;

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Cover */}
      <View style={styles.coverContainer}>
        {shop.coverImage ? (
          <Image source={{ uri: getImageUrl(shop.coverImage) }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]} />
        )}
      </View>

      {/* Shop Info */}
      <View style={styles.info}>
        <View style={styles.avatarContainer}>
          {shop.profileImage ? (
            <Image source={{ uri: getImageUrl(shop.profileImage) }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{shop.name.charAt(0)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.shopName}>{shop.name}</Text>
        <Text style={styles.description}>{shop.description}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{shop.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          {shop.neighborhood && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Ionicons name="location" size={14} color={colors.olive} />
                <Text style={styles.statLabel}>{shop.neighborhood}</Text>
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollow}
          >
            <Ionicons
              name={isFollowing ? 'checkmark' : 'add'}
              size={18}
              color={isFollowing ? colors.terracotta : colors.white}
            />
            <Text style={[styles.followText, isFollowing && styles.followingText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.messageButton}
            onPress={() =>
              navigation.navigate('Chat', {
                userId: shop.owner._id,
                userName: shop.name,
              })
            }
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.terracotta} />
          </TouchableOpacity>

          {shop.instagramHandle && (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => {
                const handle = shop.instagramHandle.replace('@', '');
                Linking.openURL(`https://instagram.com/${handle}`);
              }}
            >
              <Ionicons name="logo-instagram" size={18} color="#E1306C" />
            </TouchableOpacity>
          )}

          {shop.whatsappNumber && (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => Linking.openURL(`https://wa.me/${shop.whatsappNumber}`)}
            >
              <Ionicons name="logo-whatsapp" size={18} color={colors.success} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.productsTitle}>Products</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
        />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No products yet</Text>
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
    backgroundColor: colors.background,
  },
  coverContainer: {
    height: 160,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: colors.terracotta + '30',
  },
  info: {
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: -40,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  shopName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.terracotta,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  followingButton: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.terracotta,
  },
  followText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  followingText: {
    color: colors.terracotta,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  productsTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    alignSelf: 'flex-start',
  },
  list: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
  },
});
