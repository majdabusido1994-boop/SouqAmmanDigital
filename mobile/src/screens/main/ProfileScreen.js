import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { shopsAPI } from '../../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
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
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
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
          <Text style={styles.roleText}>{user?.role === 'seller' ? 'Seller' : 'Buyer'}</Text>
        </View>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={16} color={colors.terracotta} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        {user?.role === 'seller' || shop ? (
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
                  <Text style={styles.menuTitle}>Manage My Shop</Text>
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
                  <Text style={styles.menuTitle}>Create Shop</Text>
                  <Text style={styles.menuSubtitle}>Set up your store</Text>
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
                  <Text style={styles.menuTitle}>Add Product</Text>
                  <Text style={styles.menuSubtitle}>List something new</Text>
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
              <Text style={styles.menuTitle}>Become a Seller</Text>
              <Text style={styles.menuSubtitle}>Create your own shop</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="heart" size={20} color={colors.info} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Saved Items</Text>
            <Text style={styles.menuSubtitle}>Products you liked</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: colors.olive + '15' }]}>
            <Ionicons name="people" size={20} color={colors.olive} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Following</Text>
            <Text style={styles.menuSubtitle}>Shops you follow</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
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
