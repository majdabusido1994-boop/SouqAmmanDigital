import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { productsAPI } from '../../services/api';
import AnimatedLikeButton from '../../components/shared/AnimatedLikeButton';
import AnimatedButton from '../../components/shared/AnimatedButton';
import { getImageUrl } from '../../utils/imageUrl';

const { width } = Dimensions.get('window');

export default function FoodProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data } = await productsAPI.getById(productId);
      setProduct(data);
    } catch {
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.foodWarm} />
      </View>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images.map(getImageUrl)
    : ['https://via.placeholder.com/400x300/FFF3E6/B85C38?text=Food'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageSection}>
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

          <AnimatedLikeButton
            productId={product._id}
            size={24}
            style={styles.likeButton}
          />

          {product.isTodaySpecial && (
            <View style={styles.specialBadge}>
              <Ionicons name="flame" size={12} color={colors.white} />
              <Text style={styles.specialText}>TODAY'S SPECIAL</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price} JOD</Text>

          <Text style={styles.description}>{product.description}</Text>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            {product.prepTime && (
              <View style={styles.infoCard}>
                <Ionicons name="time" size={20} color={colors.foodWarm} />
                <Text style={styles.infoLabel}>Prep time</Text>
                <Text style={styles.infoValue}>{product.prepTime}</Text>
              </View>
            )}
            {product.servingSize && (
              <View style={styles.infoCard}>
                <Ionicons name="people" size={20} color={colors.foodHerb} />
                <Text style={styles.infoLabel}>Serves</Text>
                <Text style={styles.infoValue}>{product.servingSize}</Text>
              </View>
            )}
            {product.calories && (
              <View style={styles.infoCard}>
                <Ionicons name="flame" size={20} color={colors.foodSpice} />
                <Text style={styles.infoLabel}>Calories</Text>
                <Text style={styles.infoValue}>{product.calories}</Text>
              </View>
            )}
          </View>

          {/* Dietary Tags */}
          {product.dietaryTags && product.dietaryTags.length > 0 && (
            <View style={styles.dietarySection}>
              <Text style={styles.sectionLabel}>DIETARY</Text>
              <View style={styles.dietaryRow}>
                {product.dietaryTags.map((tag) => (
                  <View key={tag} style={styles.dietaryTag}>
                    <Text style={styles.dietaryTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Ingredients */}
          {product.ingredients && (
            <View style={styles.ingredientsSection}>
              <Text style={styles.sectionLabel}>INGREDIENTS</Text>
              <Text style={styles.ingredientsText}>{product.ingredients}</Text>
            </View>
          )}

          {/* Availability */}
          <View style={styles.availabilityCard}>
            <Ionicons
              name={product.isAvailable ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={product.isAvailable ? colors.success : colors.error}
            />
            <Text style={styles.availabilityText}>
              {product.isAvailable ? 'Available now' : 'Currently unavailable'}
            </Text>
            {product.availableUntil && (
              <Text style={styles.untilText}>until {product.availableUntil}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.actionBar}>
        <AnimatedButton
          onPress={() =>
            navigation.navigate('Chat', {
              userId: product.seller._id,
              userName: product.shop?.name,
              productId: product._id,
            })
          }
          style={styles.orderButton}
        >
          <Ionicons name="chatbubble" size={18} color={colors.white} />
          <Text style={styles.orderText}>Message to Order</Text>
        </AnimatedButton>

        {product.shop?.whatsappNumber && (
          <AnimatedButton
            onPress={() => {
              const msg = `Hi! I'd like to order "${product.name}" (${product.price} JOD)`;
              Linking.openURL(`https://wa.me/${product.shop.whatsappNumber}?text=${encodeURIComponent(msg)}`);
            }}
            style={styles.waButton}
          >
            <Ionicons name="logo-whatsapp" size={22} color={colors.success} />
          </AnimatedButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.foodCream,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.foodCream,
  },
  imageSection: {
    position: 'relative',
  },
  image: {
    width,
    height: width * 0.8,
    backgroundColor: colors.foodCream,
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
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 20,
  },
  likeButton: {
    position: 'absolute',
    top: spacing.xxl,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
  },
  specialBadge: {
    position: 'absolute',
    top: spacing.xxl,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.foodWarm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  specialText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
  },
  content: {
    padding: spacing.lg,
  },
  name: {
    ...typography.menuTitle,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foodWarm,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...shadows.soft,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textLight,
    fontSize: 9,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dietarySection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.sm,
    letterSpacing: 2,
  },
  dietaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dietaryTag: {
    backgroundColor: colors.foodHerb + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  dietaryTagText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.foodHerb,
  },
  ingredientsSection: {
    marginBottom: spacing.lg,
  },
  ingredientsText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.soft,
  },
  availabilityText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  untilText: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  actionBar: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  orderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.foodWarm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  orderText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
  },
  waButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.success,
  },
});
