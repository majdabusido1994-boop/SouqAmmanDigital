import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { adminAPI } from '../../services/api';

const ROLES = ['buyer', 'seller', 'superadmin'];

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, filterRole]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.users);
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (user) => {
    const doDelete = async () => {
      try {
        await adminAPI.deleteUser(user._id);
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
      } catch (error) {
        const msg = error.message || 'Failed to delete';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete user "${user.name}" and all their data?`)) doDelete();
    } else {
      Alert.alert('Delete User', `Delete "${user.name}" and all their data?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const changeRole = async (user, newRole) => {
    try {
      const updated = await adminAPI.updateUser(user._id, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
    } catch (error) {
      console.error('Role update error:', error);
    }
  };

  const roleColor = (role) => {
    if (role === 'superadmin') return colors.error;
    if (role === 'seller') return colors.olive;
    return colors.teal;
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        placeholderTextColor={colors.textLight}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        {['', 'buyer', 'seller', 'superadmin'].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.filterChip, filterRole === r && styles.filterActive]}
            onPress={() => setFilterRole(r)}
          >
            <Text style={[styles.filterText, filterRole === r && styles.filterTextActive]}>
              {r || 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.terracotta} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: roleColor(item.role) + '20' }]}>
                  <Text style={[styles.roleText, { color: roleColor(item.role) }]}>{item.role}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                {ROLES.filter((r) => r !== item.role).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={styles.actionBtn}
                    onPress={() => changeRole(item, r)}
                  >
                    <Text style={styles.actionText}>Make {r}</Text>
                  </TouchableOpacity>
                ))}
                {item.role !== 'superadmin' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => confirmDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No users found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchInput: {
    margin: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...typography.body,
    color: colors.textPrimary,
    ...shadows.soft,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: {
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  roleText: {
    ...typography.caption,
    fontSize: 10,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.beige,
  },
  actionText: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  deleteBtn: {
    backgroundColor: colors.error + '15',
  },
  empty: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
