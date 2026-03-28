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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { shopsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

const CATEGORIES = [
  { key: 'fashion', labelKey: 'fashion', icon: 'shirt' },
  { key: 'accessories', labelKey: 'accessories', icon: 'watch' },
  { key: 'home-decor', labelKey: 'homeDecor', icon: 'home' },
  { key: 'food', labelKey: 'food', icon: 'restaurant' },
  { key: 'art', labelKey: 'art', icon: 'color-palette' },
  { key: 'handmade', labelKey: 'handmade', icon: 'hand-left' },
  { key: 'beauty', labelKey: 'beauty', icon: 'sparkles' },
  { key: 'services', labelKey: 'services', icon: 'construct' },
  { key: 'other', labelKey: 'other', icon: 'ellipsis-horizontal' },
];

const NEIGHBORHOODS = [
  'Abdoun', 'Jabal Amman', 'Rainbow Street', 'Sweifieh',
  'Abdali', 'Shmeisani', 'Jubeiha', 'Al-Weibdeh', 'Amman',
];

export default function CreateShopScreen({ navigation }) {
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [category, setCategory] = useState('');
  const [neighborhood, setNeighborhood] = useState('Amman');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim() || !category) {
      Alert.alert(t('error'), t('fillNameDescCategory'));
      return;
    }

    setLoading(true);
    try {
      const { data: shop } = await shopsAPI.create({
        name: name.trim(),
        description: description.trim(),
        instagramHandle: instagramHandle.trim(),
        whatsappNumber: whatsappNumber.trim(),
        category,
        neighborhood,
      });
      // Refresh user to update role to seller
      await refreshUser();
      Alert.alert(t('successMsg'), t('shopCreated'), [
        {
          text: t('goToMyShop'),
          onPress: () => {
            navigation.reset({
              index: 1,
              routes: [
                { name: 'MainTabs' },
                { name: 'ManageShop', params: { shopId: shop._id } },
              ],
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t('setupYourShop')}</Text>
      <Text style={styles.subheading}>{t('tellBuyersAbout')}</Text>

      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('shopName')} *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('shopNamePlaceholder')}
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('description')} *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder={t('descriptionPlaceholder')}
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('categoryLabel')} *</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryItem, category === cat.key && styles.categoryActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon}
                size={20}
                color={category === cat.key ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  category === cat.key && styles.categoryTextActive,
                ]}
              >
                {t(cat.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Instagram */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('instagramHandle')}</Text>
        <TextInput
          style={styles.input}
          value={instagramHandle}
          onChangeText={setInstagramHandle}
          placeholder="@yourshop"
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
        />
      </View>

      {/* WhatsApp */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('whatsappNumber')}</Text>
        <TextInput
          style={styles.input}
          value={whatsappNumber}
          onChangeText={setWhatsappNumber}
          placeholder="+962..."
          placeholderTextColor={colors.textLight}
          keyboardType="phone-pad"
        />
      </View>

      {/* Neighborhood */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('neighborhood')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.neighborhoodRow}>
            {NEIGHBORHOODS.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.chip, neighborhood === n && styles.chipActive]}
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

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitText}>{t('createMyShop')}</Text>
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
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryActive: {
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
  },
  categoryText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.white,
  },
  neighborhoodRow: {
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
    backgroundColor: colors.olive,
    borderColor: colors.olive,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
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
