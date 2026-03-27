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
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const NEIGHBORHOODS = [
  'Abdoun', 'Jabal Amman', 'Rainbow Street', 'Sweifieh',
  'Abdali', 'Shmeisani', 'Jubeiha', 'Al-Weibdeh', 'Amman',
];

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        neighborhood,
        avatar,
      });
      updateUser(data);
      Alert.alert('Success', 'Profile updated!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <TouchableOpacity style={styles.avatarSection} onPress={pickAvatar}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{name?.charAt(0) || 'U'}</Text>
          </View>
        )}
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={14} color={colors.white} />
        </View>
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Phone */}
      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+962 7X XXX XXXX"
          placeholderTextColor={colors.textLight}
          keyboardType="phone-pad"
        />
      </View>

      {/* Neighborhood */}
      <View style={styles.field}>
        <Text style={styles.label}>Neighborhood</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {NEIGHBORHOODS.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.chip, neighborhood === n && styles.chipActive]}
                onPress={() => setNeighborhood(neighborhood === n ? '' : n)}
              >
                <Text style={[styles.chipText, neighborhood === n && styles.chipTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Email (read-only) */}
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <View style={[styles.input, styles.inputDisabled]}>
          <Text style={styles.disabledText}>{user?.email}</Text>
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveText}>Save Changes</Text>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    top: spacing.md + 70,
    right: '35%',
    backgroundColor: colors.terracotta,
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  changePhotoText: {
    ...typography.bodySmall,
    color: colors.terracotta,
    fontWeight: '600',
    marginTop: spacing.sm,
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
  inputDisabled: {
    backgroundColor: colors.beige,
  },
  disabledText: {
    fontSize: 15,
    color: colors.textLight,
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
  saveButton: {
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
  saveDisabled: {
    opacity: 0.7,
  },
  saveText: {
    ...typography.h3,
    color: colors.white,
  },
});
