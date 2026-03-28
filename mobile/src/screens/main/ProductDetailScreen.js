import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { productsAPI, reviewsAPI, ordersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../i18n/LanguageContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { user } = useAuth();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myReviewText, setMyReviewText] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data } = await reviewsAPI.getByProduct(productId);
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
      setReviewCount(data.count);
    } catch (error) {
      console.error('Reviews error:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (myRating === 0) {
      Alert.alert(t('error'), t('selectRating'));
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewsAPI.create(productId, { rating: myRating, text: myReviewText });
      setShowReviewForm(false);
      setMyRating(0);
      setMyReviewText('');
      fetchReviews();
    } catch (error) {
      Alert.alert(t('error'), error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, size = 14, interactive = false) => {
    return (
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setMyRating(star)}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color={star <= rating ? '#F5A623' : colors.textLight}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const fetchProduct = async () => {
    try {
      const { data } = await productsAPI.getById(productId);
      setProduct(data);
      setLiked(data.likes?.includes(user?.id));
    } catch (error) {
      Alert.alert('Error', 'Product not found');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await productsAPI.like(productId);
      setLiked(!liked);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleMessage = () => {
    if (product?.seller) {
      navigation.navigate('Chat', {
        userId: product.seller._id,
        userName: product.seller.name,
        productId: product._id,
      });
    }
  };

  const handleWhatsApp = () => {
    if (product?.shop?.whatsappNumber) {
      const msg = `Hi! I'm interested in "${product.name}" (${product.price} JOD) from SOUQ AMMAN DIGITAL`;
      const url = `https://wa.me/${product.shop.whatsappNumber}?text=${encodeURIComponent(msg)}`;
      Linking.openURL(url);
    }
  };

  const handleInstagram = () => {
    if (product?.shop?.instagramHandle) {
      const handle = product.shop.instagramHandle.replace('@', '');
      Linking.openURL(`https://instagram.com/${handle}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images.map(getImageUrl)
    : ['https://via.placeholder.com/400x400/F5E6D3/C4763B?text=No+Image'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <FlatList
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={images}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={(e) => {
            setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width));
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
          )}
        />
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, activeImage === i && styles.dotActive]} />
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? colors.error : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price} JOD</Text>
          {product.acceptsOffers && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('acceptsOffers')}</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{product.name}</Text>

        <TouchableOpacity
          style={styles.shopRow}
          onPress={() => navigation.navigate('ShopDetail', { shopId: product.shop._id })}
        >
          {product.shop?.profileImage ? (
            <Image source={{ uri: getImageUrl(product.shop.profileImage) }} style={styles.shopAvatar} />
          ) : (
            <View style={[styles.shopAvatar, styles.shopAvatarPlaceholder]}>
              <Text style={styles.shopAvatarText}>
                {product.shop?.name?.charAt(0) || 'S'}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.shopName}>{product.shop?.name}</Text>
            {product.shop?.instagramHandle && (
              <Text style={styles.instagram}>{product.shop.instagramHandle}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('description')}</Text>
        <Text style={styles.description}>{product.description}</Text>

        {product.neighborhood && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.olive} />
            <Text style={styles.location}>{product.neighborhood}, Amman</Text>
          </View>
        )}

        {product.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {product.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('reviewsTitle')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              {renderStars(Math.round(avgRating))}
              <Text style={styles.ratingText}>
                {avgRating > 0 ? avgRating.toFixed(1) : t('noReviews')} ({reviewCount})
              </Text>
            </View>
          </View>
          {product.seller?._id !== user?.id && (
            <TouchableOpacity
              style={styles.writeReviewBtn}
              onPress={() => setShowReviewForm(!showReviewForm)}
            >
              <Ionicons name="create-outline" size={16} color={colors.terracotta} />
              <Text style={styles.writeReviewText}>{t('writeReview')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {showReviewForm && (
          <View style={styles.reviewForm}>
            <Text style={styles.reviewFormLabel}>{t('yourRating')}</Text>
            {renderStars(myRating, 28, true)}
            <TextInput
              style={styles.reviewInput}
              value={myReviewText}
              onChangeText={setMyReviewText}
              placeholder={t('shareExperience')}
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitReviewBtn, submittingReview && { opacity: 0.7 }]}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitReviewText}>{t('submitReview')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {reviews.slice(0, 5).map((review) => (
          <View key={review._id} style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{review.user?.name?.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.reviewName}>{review.user?.name}</Text>
                  {renderStars(review.rating)}
                </View>
              </View>
              <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {review.text && <Text style={styles.reviewText}>{review.text}</Text>}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {product.seller?._id !== user?.id && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              Alert.alert(
                t('placeOrder'),
                `Order "${product.name}" for ${product.price} JOD?`,
                [
                  { text: t('cancel'), style: 'cancel' },
                  {
                    text: t('cashOnPickup'),
                    onPress: async () => {
                      try {
                        await ordersAPI.create({
                          items: [{ productId: product._id, quantity: 1 }],
                          shopId: product.shop._id,
                          paymentMethod: 'cash',
                          deliveryMethod: 'pickup',
                        });
                        Alert.alert(t('orderPlaced'), t('sellerWillConfirm'), [
                          { text: t('viewOrders'), onPress: () => navigation.navigate('Orders') },
                        ]);
                      } catch (error) {
                        Alert.alert(t('error'), error.message);
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="bag-check-outline" size={20} color={colors.white} />
            <Text style={styles.primaryButtonText}>{t('orderNow')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={handleMessage}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.terracotta} />
          <Text style={styles.secondaryButtonText}>{t('messageSeller')}</Text>
        </TouchableOpacity>

        {product.acceptsOffers && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('Chat', {
                userId: product.seller._id,
                userName: product.seller.name,
                productId: product._id,
                messageType: 'offer',
              })
            }
          >
            <Ionicons name="pricetag-outline" size={20} color={colors.terracotta} />
            <Text style={styles.secondaryButtonText}>{t('makeOffer')}</Text>
          </TouchableOpacity>
        )}

        {product.acceptsCustomOrders && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('Chat', {
                userId: product.seller._id,
                userName: product.seller.name,
                productId: product._id,
                messageType: 'custom-order',
              })
            }
          >
            <Ionicons name="construct-outline" size={20} color={colors.terracotta} />
            <Text style={styles.secondaryButtonText}>{t('requestCustomOrder')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.socialRow}>
          {product.shop?.whatsappNumber && (
            <TouchableOpacity style={styles.socialButton} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={22} color={colors.success} />
              <Text style={styles.socialText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
          {product.shop?.instagramHandle && (
            <TouchableOpacity style={styles.socialButton} onPress={handleInstagram}>
              <Ionicons name="logo-instagram" size={22} color="#E1306C" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width,
    height: width,
  },
  dots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 24,
  },
  likeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.price,
    fontSize: 24,
    color: colors.terracotta,
  },
  badge: {
    backgroundColor: colors.olive + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.olive,
    fontSize: 10,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  shopAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  shopAvatarPlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopAvatarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  shopName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  instagram: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  location: {
    ...typography.bodySmall,
    color: colors.olive,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.sand,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: colors.terracotta,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  primaryButtonText: {
    ...typography.h3,
    color: colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.terracotta,
  },
  secondaryButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.terracotta,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  reviewsSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  ratingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.terracotta + '40',
  },
  writeReviewText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.terracotta,
  },
  reviewForm: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  reviewFormLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  reviewInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 70,
  },
  submitReviewBtn: {
    backgroundColor: colors.terracotta,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  submitReviewText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.white,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.olive + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontWeight: '700',
    color: colors.olive,
    fontSize: 14,
  },
  reviewName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reviewDate: {
    ...typography.bodySmall,
    color: colors.textLight,
    fontSize: 11,
  },
  reviewText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
});
