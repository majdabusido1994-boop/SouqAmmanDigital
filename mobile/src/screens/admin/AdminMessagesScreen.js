import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';

export default function AdminMessagesScreen() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await adminAPI.getMessages();
      setMessages(data.messages);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (msg) => {
    const doDelete = async () => {
      try {
        await adminAPI.deleteMessage(msg._id);
        setMessages((prev) => prev.filter((m) => m._id !== msg._id));
      } catch (error) {
        const errMsg = error.message || 'Failed to delete';
        Platform.OS === 'web' ? window.alert(errMsg) : Alert.alert('Error', errMsg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete this message?')) doDelete();
    } else {
      Alert.alert(t('deleteMessage'), 'Delete this message?', [
        { text: 'Cancel', style: 'cancel' },
        { text: t('deleteMessage'), style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={messages}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sender}>{item.sender?.name || 'Unknown'}</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.textLight} />
            <Text style={styles.receiver}>{item.receiver?.name || 'Unknown'}</Text>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={3}>{item.text}</Text>
          {item.messageType !== 'text' && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.messageType}</Text>
              {item.offerAmount && <Text style={styles.typeText}> · {item.offerAmount} JOD</Text>}
            </View>
          )}
          <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
            <Ionicons name="trash-outline" size={14} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>{t('noMessages')}</Text>
      }
    />
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
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sender: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.terracotta,
  },
  receiver: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.olive,
  },
  date: {
    fontSize: 10,
    color: colors.textLight,
    marginLeft: 'auto',
  },
  messageText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  typeBadge: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  typeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.golden,
  },
  deleteBtn: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },
  empty: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
