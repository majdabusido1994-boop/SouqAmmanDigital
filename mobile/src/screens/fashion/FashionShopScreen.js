import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { shopsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LookbookCard from '../../components/fashion/LookbookCard';
import CountdownTimer from '../../components/shared/CountdownTimer';
import VerifiedBadge from '../../components/shared/VerifiedBadge';
import AnimatedButton from '../../components/shared/AnimatedButton';

const { width, height } = Dimensions.get('window');

export default function FashionShopScreen({ route, navigation }) {
  const { shopId } = route.params;
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState('lookbook'); // lookbook | grid
  const scrollY = useRef(new Animated.Value(0)).current;

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
        <ActivityIndicator size="large" color={colors.fashionGold} />
      </View>
    );
  }

  if (!shop) return null;

  const newDrops = products.filter((p) => p.isNewDrop);
  const nextDrop = shop.nextDropDate;

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Hero Cover */}
      <View style={styles.heroContainer}>
        {shop.coverImage ? (
          <Image source={{ uri: shop.coverImage }} style={styles.heroCover} />
        ) : (
          <View style={[styles.heroCover, { backgroundColor: colors.fashionBlack }]} />
        )}
        <View style={styles.heroOverlay} />

        <View style={styles.heroContent}>
          {shop.profileImage ? (
            <Image source={{ uri: shop.profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{shop.name.charAt(0)}</Text>
            </View>
          )}

          <View style={styles.nameRow}>
            <Text style={styles.shopName}>{shop.name}</Text>
            {shop.isVerified && <VerifiedBadge size="large" />}
          </View>

          <Text style={styles.description}>{shop.description}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Text style={styles.stat}>
              <Text style={styles.statNum}>{products.length}</Text> pieces
            </Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.stat}>
              <Text style={styles.statNum}>{shop.followers?.length || 0}</Text> followers
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <AnimatedButton
              onPress={handleFollow}
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
            >
              <Text style={[styles.followText, isFollowing && styles.followingText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </AnimatedButton>

            {shop.instagramHandle && (
              <AnimatedButton
                onPress={() => {
                  const handle = shop.instagramHandle.replace('@', '');
                  Linking.openURL(`https://instagram.com/${handle}`);
                }}
                style={styles.igButton}
              >
                <Ionicons name="logo-instagram" size={18} color={colors.white} />
                <Text style={styles.igText}>{shop.instagramHandle}</Text>
              </AnimatedButton>
            )}
          </View>
        </View>
      </View>

      {/* Drop Countdown */}
      {nextDrop && (
        <View style={styles.dropSection}>
          <CountdownTimer targetDate={nextDrop} label="NEXT DROP" />
        </View>
      )}

      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewBtn, viewMode === 'lookbook' && styles.viewBtnActive]}
          onPress={() => setViewMode('lookbook')}
        >
          <Ionicons
            name="albums"
            size={18}
            color={viewMode === 'lookbook' ? colors.white : colors.textLight}
          />
          <Text style={[styles.viewText, viewMode === 'lookbook' && styles.viewTextActive]}>
            Lookbook
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewBtn, viewMode === 'grid' && styles.viewBtnActive]}
          onPress={() => setViewMode('grid')}
        >
          <Ionicons
            name="grid"
            size={18}
            color={viewMode === 'grid' ? colors.white : colors.textLight}
          />
          <Text style={[styles.viewText, viewMode === 'grid' && styles.viewTextActive]}>
            Grid
          </Text>
        </TouchableOpacity>
      </View>

      {/* New Drops Section */}
      {newDrops.length > 0 && (
        <View style={styles.dropsSection}>
          <Text style={styles.sectionTitle}>NEW DROPS</Text>
        </View>
      )}
    </View>
  );

  if (viewMode === 'lookbook') {
    return (
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <LookbookCard
              product={item}
              onPress={() => navigation.navigate('FashionProduct', { productId: item._id })}
              onShopPress={() => {}}
            />
          )}
          snapToInterval={height * 0.85}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  // Grid View
  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate('FashionProduct', { productId: item._id })}
          >
            <Image
              source={{ uri: item.images?.[0] || 'https://via.placeholder.com/200x300/F5E6D3/C4763B' }}
              style={styles.gridImage}
            />
            {item.isNewDrop && (
              <View style={styles.gridDropBadge}>
                <Text style={styles.gridDropText}>NEW</Text>
              </View>
            )}
            <View style={styles.gridInfo}>
              <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.gridPrice}>{item.price} JOD</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fashionCream,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fashionBlack,
  },
  header: {},
  heroContainer: {
    height: 400,
    position: 'relative',
  },
  heroCover: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,18,16,0.55)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.fashionGold,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  shopName: {
    ...typography.editorialBold,
    fontSize: 26,
    color: colors.white,
  },
  description: {
    ...typography.body,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stat: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.6)',
  },
  statNum: {
    fontWeight: '700',
    color: colors.white,
  },
  statDot: {
    color: 'rgba(255,255,255,0.3)',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  followBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.white,
  },
  followText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.fashionBlack,
  },
  followingText: {
    color: colors.white,
  },
  igButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  igText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '500',
  },
  dropSection: {
    padding: spacing.lg,
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.beige,
    borderRadius: borderRadius.full,
    padding: 3,
  },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  viewBtnActive: {
    backgroundColor: colors.fashionBlack,
  },
  viewText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textLight,
  },
  viewTextActive: {
    color: colors.white,
  },
  dropsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.fashionGold,
    letterSpacing: 3,
  },
  // Grid styles
  gridContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  gridRow: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  gridItem: {
    flex: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.beige,
  },
  gridDropBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.fashionGold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gridDropText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.fashionBlack,
    letterSpacing: 1,
  },
  gridInfo: {
    padding: spacing.sm,
  },
  gridName: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  gridPrice: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.terracotta,
    marginTop: 2,
  },
});
