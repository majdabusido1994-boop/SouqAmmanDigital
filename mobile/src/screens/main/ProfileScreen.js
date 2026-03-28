import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { shopsAPI } from '../../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [shop, setShop] = useState(null);

  useEffect(() => {
    fetchShop();
  }, [user]);

  const fetchShop = async () => {
    try {
      const { data } = await shopsAPI.getMine();
      if (data.shop) setShop(data.shop);
    } catch (error) {
      // No shop found is expected for buyers
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('confirmSignOut'))) {
        logout();
      }
    } else {
      Alert.alert(t('logout'), t('confirmSignOut'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('signOut'), style: 'destructive', onPress: logout },
      ]);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role === 'superadmin' ? t('admin') : user?.role === 'seller' ? t('seller') : t('buyer')}</Text>
        </View>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={16} color={colors.terracotta} />
          <Text style={styles.editProfileText}>{t('editProfile')}</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Panel */}
      {user?.role === 'superadmin' && (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('AdminPanel')}
        >
          <Ionicons name="shield-checkmark" size={20} color={colors.white} />
          <Text style={styles.adminButtonText}>{t('adminPanel')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Menu Items */}
      <View style={styles.section}>
        {user?.role === 'seller' || user?.role === 'superadmin' || shop ? (
          <>
            {shop ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('ManageShop', { shopId: shop._id })}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.terracotta + '15' }]}>
                  <Ionicons name="storefront" size={20} color={colors.terracotta} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{t('manageMyShop')}</Text>
                  <Text style={styles.menuSubtitle}>{shop.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('CreateShop')}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.terracotta + '15' }]}>
                  <Ionicons name="add-circle" size={20} color={colors.terracotta} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{t('createShop')}</Text>
                  <Text style={styles.menuSubtitle}>{t('setupStore')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}

            {shop && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('AddProduct')}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.olive + '15' }]}>
                  <Ionicons name="pricetag" size={20} color={colors.olive} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{t('addProduct')}</Text>
                  <Text style={styles.menuSubtitle}>{t('listNew')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('CreateShop')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.terracotta + '15' }]}>
              <Ionicons name="storefront" size={20} color={colors.terracotta} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{t('becomeSeller')}</Text>
              <Text style={styles.menuSubtitle}>{t('createOwnShop')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="heart" size={20} color={colors.info} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t('savedItems')}</Text>
            <Text style={styles.menuSubtitle}>{t('productsLiked')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: colors.olive + '15' }]}>
            <Ionicons name="people" size={20} color={colors.olive} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t('following')}</Text>
            <Text style={styles.menuSubtitle}>{t('shopsFollow')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Language Switcher */}
      <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
        <Ionicons name="language" size={20} color={colors.terracotta} />
        <Text style={styles.languageText}>{t('language')}</Text>
        <View style={styles.languageToggle}>
          <Text style={[styles.langOption, language === 'en' && styles.langActive]}>EN</Text>
          <Text style={styles.langDivider}>|</Text>
          <Text style={[styles.langOption, language === 'ar' && styles.langActive]}>عربي</Text>
        </View>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>{t('signOut')}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SOUQ AMMAN DIGITAL v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: spacing.xl,
    backgroundColor: colors.beigeLight,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
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
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.terracotta + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  roleText: {
    ...typography.caption,
    color: colors.terracotta,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.terracotta + '40',
  },
  editProfileText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.terracotta,
  },
  section: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 1,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.terracottaDark || '#A55D2B',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  adminButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  languageText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.beige,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  langOption: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  langActive: {
    color: colors.terracotta,
    fontWeight: '700',
  },
  langDivider: {
    color: colors.textLight,
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  logoutText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.error,
  },
  version: {
    ...typography.bodySmall,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
