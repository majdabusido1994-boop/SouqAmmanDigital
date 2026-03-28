import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { productsAPI } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';

const CATEGORIES = [
  'fashion', 'accessories', 'home-decor', 'food',
  'art', 'handmade', 'beauty', 'services', 'other',
];

const NEIGHBORHOODS = [
  'Abdoun', 'Jabal Amman', 'Rainbow Street', 'Sweifieh',
  'Abdali', 'Shmeisani', 'Jubeiha', 'Al-Weibdeh', 'Amman',
];

const CATEGORY_LABELS = {
  'fashion': 'fashion', 'accessories': 'accessories', 'home-decor': 'homeDecor',
  'food': 'food', 'art': 'art', 'handmade': 'handmade',
  'beauty': 'beauty', 'services': 'services', 'other': 'other',
};

export default function AddProductScreen({ navigation }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [neighborhood, setNeighborhood] = useState('Amman');
  const [tags, setTags] = useState('');
  const [acceptsOffers, setAcceptsOffers] = useState(true);
  const [acceptsCustomOrders, setAcceptsCustomOrders] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 5));
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim() || !description.trim() || !price || !category) {
      Alert.alert(t('error'), t('fillProductFields'));
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert(t('error'), t('validPrice'));
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        neighborhood,
        tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        acceptsOffers,
        acceptsCustomOrders,
      };

      const { data: product } = await productsAPI.create(productData);

      // Upload images if any were selected
      if (images.length > 0) {
        try {
          const formData = new FormData();
          images.forEach((uri, index) => {
            formData.append('images', {
              uri,
              name: `product-${Date.now()}-${index}.jpg`,
              type: 'image/jpeg',
            });
          });
          await productsAPI.uploadImages(product._id, formData);
        } catch (uploadError) {
          console.warn('Image upload failed:', uploadError);
          // Product created successfully, images can be added later
        }
      }

      Alert.alert(t('successMsg'), t('productListed'), [
        { text: t('ok'), onPress: () => navigation.navigate('ManageShop') },
      ]);
    } catch (error) {
      Alert.alert(t('error'), error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Images */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('photosUpTo5')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.imagesRow}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImage} onPress={pickImage}>
                <Ionicons name="camera" size={28} color={colors.terracotta} />
                <Text style={styles.addImageText}>{t('addPhoto')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>{`${t('productNameLabel')} *`}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('whatAreYouSelling')}
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>{`${t('description')} *`}</Text>
        <View style={styles.textAreaWrapper}>
          <View style={styles.innerShadowTop} />
          <View style={styles.innerShadowLeft} />
          <View style={styles.innerShadowRight} />
          <View style={styles.innerShadowBottom} />
          <TextInput
            style={[styles.input, styles.textArea, styles.textAreaInput]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('describeYourProduct')}
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Price */}
      <View style={styles.field}>
        <Text style={styles.label}>{`${t('priceJOD')} *`}</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="0.00"
          placeholderTextColor={colors.textLight}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>{`${t('categoryLabel')} *`}</Text>
        <View style={styles.chipGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {t(CATEGORY_LABELS[cat])}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tags */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('tagsLabel')}</Text>
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="handmade, vintage, gift"
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Neighborhood */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('neighborhood')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {NEIGHBORHOODS.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.chip, neighborhood === n && styles.neighborhoodActive]}
                onPress={() => setNeighborhood(n)}
              >
                <Text style={[styles.chipText, neighborhood === n && styles.chipTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Options */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('optionsLabel')}</Text>
        <TouchableOpacity
          style={styles.toggle}
          onPress={() => setAcceptsOffers(!acceptsOffers)}
        >
          <Ionicons
            name={acceptsOffers ? 'checkbox' : 'square-outline'}
            size={22}
            color={acceptsOffers ? colors.terracotta : colors.textLight}
          />
          <Text style={styles.toggleText}>{t('acceptOffersOption')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggle}
          onPress={() => setAcceptsCustomOrders(!acceptsCustomOrders)}
        >
          <Ionicons
            name={acceptsCustomOrders ? 'checkbox' : 'square-outline'}
            size={22}
            color={acceptsCustomOrders ? colors.terracotta : colors.textLight}
          />
          <Text style={styles.toggleText}>{t('acceptCustomOrdersOption')}</Text>
        </TouchableOpacity>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitText}>{t('listProduct')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
  },
  textAreaWrapper: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#F2EFEB',
    borderWidth: 1.5,
    borderTopColor: '#C8C2BA',
    borderLeftColor: '#C8C2BA',
    borderBottomColor: '#E0DCD7',
    borderRightColor: '#E0DCD7',
  },
  textAreaInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
  },
  innerShadowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 1,
  },
  innerShadowLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(0,0,0,0.03)',
    zIndex: 1,
  },
  innerShadowRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(0,0,0,0.015)',
    zIndex: 1,
  },
  innerShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    zIndex: 1,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  removeImage: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.terracotta + '08',
  },
  addImageText: {
    ...typography.bodySmall,
    color: colors.terracotta,
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
  },
  neighborhoodActive: {
    backgroundColor: colors.olive,
    borderColor: colors.olive,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: colors.white,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  toggleText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.terracotta,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    ...typography.h3,
    color: colors.white,
  },
});
