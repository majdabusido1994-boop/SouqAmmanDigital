import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { adminAPI } from '../../services/api';

export default function AdminPanelScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  const sections = [
    {
      title: 'Users',
      icon: 'people',
      count: stats?.users || 0,
      color: colors.terracotta,
      screen: 'AdminUsers',
    },
    {
      title: 'Shops',
      icon: 'storefront',
      count: stats?.shops || 0,
      color: colors.olive,
      screen: 'AdminShops',
    },
    {
      title: 'Products',
      icon: 'pricetag',
      count: stats?.products || 0,
      color: colors.teal,
      screen: 'AdminProducts',
    },
    {
      title: 'Messages',
      icon: 'chatbubbles',
      count: stats?.messages || 0,
      color: colors.golden,
      screen: 'AdminMessages',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={32} color={colors.terracotta} />
        <Text style={styles.title}>Super Admin</Text>
        <Text style={styles.subtitle}>Full control panel</Text>
      </View>

      <View style={styles.grid}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.title}
            style={styles.card}
            onPress={() => navigation.navigate(section.screen)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: section.color + '15' }]}>
              <Ionicons name={section.icon} size={28} color={section.color} />
            </View>
            <Text style={styles.cardCount}>{section.count}</Text>
            <Text style={styles.cardTitle}>{section.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardCount: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  cardTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
});
