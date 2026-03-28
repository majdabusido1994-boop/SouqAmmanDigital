import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ChatScreen({ route, navigation }) {
  const { userId, userName, productId, messageType: initialType } = route.params;
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [messageType, setMessageType] = useState(initialType || 'text');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: userName });
    fetchMessages();
  }, [userId]);

  const fetchMessages = async () => {
    try {
      const { data } = await messagesAPI.getMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const trimmedText = text.trim();
    if (!trimmedText && messageType === 'text') return;

    try {
      const payload = {
        text: trimmedText || (messageType === 'offer'
          ? `I'd like to offer ${offerAmount} JOD`
          : 'I\'d like to request a custom order'),
        productId,
        messageType,
        offerAmount: messageType === 'offer' ? Number(offerAmount) : undefined,
      };

      const { data } = await messagesAPI.send(userId, payload);
      setMessages((prev) => [...prev, data]);
      setText('');
      setOfferAmount('');
      setMessageType('text');
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender._id === user?.id;

    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        {item.messageType === 'offer' && (
          <View style={styles.offerBadge}>
            <Ionicons name="pricetag" size={12} color={colors.terracotta} />
            <Text style={styles.offerBadgeText}>{`${t('offerColon')} ${item.offerAmount} JOD`}</Text>
          </View>
        )}
        {item.messageType === 'custom-order' && (
          <View style={styles.offerBadge}>
            <Ionicons name="construct" size={12} color={colors.olive} />
            <Text style={[styles.offerBadgeText, { color: colors.olive }]}>{t('customOrderLabel')}</Text>
          </View>
        )}
        <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.text}</Text>
        <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        renderItem={renderMessage}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('startConversation')}</Text>
          </View>
        }
      />

      {/* Offer Input */}
      {messageType === 'offer' && (
        <View style={styles.offerBar}>
          <Text style={styles.offerLabel}>{t('yourOfferJOD')}</Text>
          <TextInput
            style={styles.offerInput}
            value={offerAmount}
            onChangeText={setOfferAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textLight}
          />
          <TouchableOpacity onPress={() => setMessageType('text')}>
            <Ionicons name="close" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder={
            messageType === 'offer'
              ? t('addMessageWithOffer')
              : messageType === 'custom-order'
              ? t('describeWhatYouWant')
              : t('typeMessage')
          }
          placeholderTextColor={colors.textLight}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() && messageType === 'text') && styles.sendDisabled]}
          onPress={sendMessage}
          disabled={!text.trim() && messageType === 'text'}
        >
          <Ionicons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.beigeLight,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.beigeLight,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.terracotta,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  myMessageText: {
    color: colors.white,
  },
  messageTime: {
    ...typography.bodySmall,
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.beigeLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  offerBadgeText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.terracotta,
    fontSize: 11,
  },
  offerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.sand,
    gap: spacing.sm,
  },
  offerLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  offerInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.beigeLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
  },
});
