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
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { messagesAPI } from '../../services/api';
import AnimatedButton from '../../components/shared/AnimatedButton';

export default function CustomOrderScreen({ route, navigation }) {
  const { sellerId, shopName, productId } = route.params;
  const [details, setDetails] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [referenceImages, setReferenceImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setReferenceImages((prev) => [...prev, result.assets[0].uri].slice(0, 3));
    }
  };

  const handleSubmit = async () => {
    if (!details.trim()) {
      Alert.alert('Error', 'Please describe what you\'d like made');
      return;
    }

    setLoading(true);
    try {
      const text = [
        `CUSTOM ORDER REQUEST`,
        ``,
        `Details: ${details.trim()}`,
        budget ? `Budget: ${budget} JOD` : '',
        timeline ? `Timeline: ${timeline}` : '',
      ].filter(Boolean).join('\n');

      await messagesAPI.send(sellerId, {
        text,
        productId,
        messageType: 'custom-order',
      });

      Alert.alert(
        'Request Sent!',
        `Your custom order request has been sent to ${shopName}. They'll respond in your messages.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Messages') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="construct" size={28} color={colors.craftClay} />
        </View>
        <Text style={styles.title}>Request Custom Order</Text>
        <Text style={styles.subtitle}>from {shopName}</Text>
      </View>

      {/* Details */}
      <View style={styles.field}>
        <Text style={styles.label}>What would you like made? *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={details}
          onChangeText={setDetails}
          placeholder="Describe your vision... materials, colors, size, style, any specific details"
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Reference Images */}
      <View style={styles.field}>
        <Text style={styles.label}>Reference images (optional)</Text>
        <Text style={styles.hint}>Share inspiration photos to help the artisan understand your vision</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.imagesRow}>
            {referenceImages.map((uri, i) => (
              <View key={i} style={styles.imageWrap}>
                <Image source={{ uri }} style={styles.refImage} />
                <TouchableOpacity
                  style={styles.removeImg}
                  onPress={() => setReferenceImages((p) => p.filter((_, idx) => idx !== i))}
                >
                  <Ionicons name="close" size={12} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
            {referenceImages.length < 3 && (
              <TouchableOpacity style={styles.addImage} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color={colors.craftClay} />
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Budget */}
      <View style={styles.field}>
        <Text style={styles.label}>Budget (JOD)</Text>
        <TextInput
          style={styles.input}
          value={budget}
          onChangeText={setBudget}
          placeholder="Your budget range"
          placeholderTextColor={colors.textLight}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Timeline */}
      <View style={styles.field}>
        <Text style={styles.label}>When do you need it?</Text>
        <View style={styles.timelineOptions}>
          {['No rush', '1-2 weeks', 'This week', 'ASAP'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.timeChip, timeline === opt && styles.timeChipActive]}
              onPress={() => setTimeline(opt)}
            >
              <Text style={[styles.timeChipText, timeline === opt && styles.timeChipTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit */}
      <AnimatedButton
        onPress={handleSubmit}
        style={[styles.submitBtn, loading && styles.submitDisabled]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name="send" size={18} color={colors.white} />
            <Text style={styles.submitText}>Submit Request</Text>
          </>
        )}
      </AnimatedButton>

      <Text style={styles.note}>
        The artisan will review your request and respond with pricing and availability.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.craftPaper,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.craftClay + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.craftEarth,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.craftEarth,
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginBottom: spacing.sm,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.sandDark + '40',
  },
  textArea: {
    minHeight: 140,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageWrap: {
    position: 'relative',
  },
  refImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  removeImg: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.craftClay + '50',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.craftClay + '05',
  },
  addImageText: {
    fontSize: 11,
    color: colors.craftClay,
    marginTop: 2,
  },
  timelineOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.sandDark + '40',
  },
  timeChipActive: {
    backgroundColor: colors.craftClay,
    borderColor: colors.craftClay,
  },
  timeChipText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  timeChipTextActive: {
    color: colors.white,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.craftClay,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
    marginBottom: spacing.md,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    ...typography.h3,
    color: colors.white,
  },
  note: {
    ...typography.bodySmall,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
