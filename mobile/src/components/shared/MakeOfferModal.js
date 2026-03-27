import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import AnimatedButton from './AnimatedButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MakeOfferModal({ visible, onClose, onSubmit, product }) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return;
    onSubmit({
      offerAmount: Number(amount),
      message: message.trim() || `I'd like to offer ${amount} JOD for "${product?.name}"`,
    });
    setAmount('');
    setMessage('');
  };

  const suggestedPrices = product?.price
    ? [
        Math.round(product.price * 0.7),
        Math.round(product.price * 0.85),
        Math.round(product.price * 0.95),
      ]
    : [];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="pricetag" size={22} color={colors.terracotta} />
            <Text style={styles.title}>Make an Offer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Product Info */}
          {product && (
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>Listed at {product.price} JOD</Text>
            </View>
          )}

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={styles.currency}>JD</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          {/* Suggested Prices */}
          {suggestedPrices.length > 0 && (
            <View style={styles.suggestions}>
              {suggestedPrices.map((price) => (
                <TouchableOpacity
                  key={price}
                  style={[styles.suggestionChip, amount === String(price) && styles.suggestionActive]}
                  onPress={() => setAmount(String(price))}
                >
                  <Text
                    style={[styles.suggestionText, amount === String(price) && styles.suggestionTextActive]}
                  >
                    {price} JOD
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Message */}
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Add a message (optional)"
            placeholderTextColor={colors.textLight}
            multiline
          />

          {/* Submit */}
          <AnimatedButton onPress={handleSubmit} style={styles.submitButton} disabled={!amount}>
            <Ionicons name="send" size={18} color={colors.white} />
            <Text style={styles.submitText}>Send Offer</Text>
          </AnimatedButton>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayDark,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    ...shadows.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.beigeLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    backgroundColor: colors.beigeLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  productName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  productPrice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  currency: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.textLight,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.terracotta,
    minWidth: 100,
    textAlign: 'center',
  },
  suggestions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.beigeLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionActive: {
    backgroundColor: colors.terracotta + '15',
    borderColor: colors.terracotta,
  },
  suggestionText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  suggestionTextActive: {
    color: colors.terracotta,
  },
  messageInput: {
    backgroundColor: colors.beigeLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 60,
    marginBottom: spacing.lg,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.terracotta,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  submitText: {
    ...typography.h3,
    color: colors.white,
  },
});
