import React, { useState, useEffect } from 'react';
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
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../i18n/LanguageContext';

const CATEGORIES = [
  'fashion', 'accessories', 'home-decor', 'food',
  'art', 'handmade', 'beauty', 'services', 'other',
];

const CATEGORY_LABELS = {
  'fashion': 'fashion', 'accessories': 'accessories', 'home-decor': 'homeDecor',
  'food': 'food', 'art': 'art', 'handmade': 'handmade',
  'beauty': 'beauty', 'services': 'services', 'other': 'other',
};

const NEIGHBORHOODS = [
  'Abdoun', 'Jabal Amman', 'Rainbow Street', 'Sweifieh',
  'Abdali', 'Shmeisani', 'Jubeiha', 'Al-Weibdeh', 'Amman',
];

export default function EditProductScreen({ route, navigation }) {
  const { t } = useLanguage();
  const { productId } = route.params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [neighborhood, setNeighborhood] = useState('Amman');
  const [tags, setTags] = useState('');
  const [acceptsOffers, setAcceptsOffers] = useState(true);
  const [acceptsCustomOrders, setAcceptsCustomOrders] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data } = await productsAPI.getById(productId);
      setName(data.name);
      setDescription(data.description);
      setPrice(String(data.price));
      setCategory(data.category);
      setNeighborhood(data.neighborhood || 'Amman');
      setTags(data.tags?.join(', ') || '');
      setAcceptsOffers(data.acceptsOffers ?? true);
      setAcceptsCustomOrders(data.acceptsCustomOrders ?? false);
      setExistingImages(data.images || []);
    } catch (error) {
      Alert.alert('Error', 'Product not found');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const total = existingImages.length + newImages.length;
      const remaining = 5 - total;
      if (remaining > 0) {
        setNewImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, remaining));
      }
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !price || !category) {
      Alert.alert(t('error'), t('fillProductFields'));
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert(t('error'), t('validPrice'));
      return;
    }

    setSaving(true);
    try {
      await productsAPI.update(productId, {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        neighborhood,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        acceptsOffers,
        acceptsCustomOrders,
        images: existingImages,
      });

      // Upload new images if any
      if (newImages.length > 0) {
        try {
          const formData = new FormData();
          newImages.forEach((uri, index) => {
            formData.append('images', {
              uri,
              name: `product-${Date.now()}-${index}.jpg`,
              type: 'image/jpeg',
            });
          });
          await productsAPI.uploadImages(productId, formData);
        } catch (uploadError) {
          console.warn('Image upload failed:', uploadError);
        }
      }

      Alert.alert(t('successMsg'), t('productUpdated'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(t('error'), error.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('deleteProduct'),
      t('cannotBeUndone'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await productsAPI.delete(productId);
              Alert.alert(t('deleted'), t('productRemoved'), [
                { text: t('ok'), onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert(t('error'), error.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Images */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('photos')} ({totalImages}/5)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.imagesRow}>
            {existingImages.map((img, index) => (
              <View key={`existing-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri: getImageUrl(img) }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => removeExistingImage(index)}
                >
                  <Ionicons name="close" size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
            {newImages.map((uri, index) => (
              <View key={`new-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => removeNewImage(index)}
                >
                  <Ionicons name="close" size={14} color={colors.white} />
                </TouchableOpacity>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              </View>
            ))}
            {totalImages < 5 && (
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
        <Text style={styles.label}>{t('productNameLabel')} *</Text>
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
        <Text style={styles.label}>{t('description')} *</Text>
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
        <Text style={styles.label}>{t('priceJOD')} *</Text>
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
        <Text style={styles.label}>{t('categoryLabel')} *</Text>
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

      {/* Save */}
      <TouchableOpacity
        style={[styles.submitButton, saving && styles.submitDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitText}>{t('saveChanges')}</Text>
        )}
      </TouchableOpacity>

      {/* Delete */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
        <Text style={styles.deleteText}>{t('deleteProduct')}</Text>
      </TouchableOpacity>
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
  newBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: colors.olive,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.white,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  deleteText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.error,
  },
});
