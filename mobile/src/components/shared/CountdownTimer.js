import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { createPulse } from '../../utils/animations';

export default function CountdownTimer({ targetDate, label = 'Drops in', onComplete }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = createPulse(pulseAnim, 2000);
    animation.start();
    return () => animation.stop();
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsExpired(true);
        onComplete?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isExpired) {
    return (
      <View style={styles.expiredContainer}>
        <Text style={styles.expiredText}>LIVE NOW</Text>
      </View>
    );
  }

  const blocks = [
    { value: timeLeft.days, label: 'DAYS' },
    { value: timeLeft.hours, label: 'HRS' },
    { value: timeLeft.minutes, label: 'MIN' },
    { value: timeLeft.seconds, label: 'SEC' },
  ];

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.blocksRow}>
        {blocks.map((block, i) => (
          <React.Fragment key={block.label}>
            <View style={styles.block}>
              <Text style={styles.value}>{String(block.value).padStart(2, '0')}</Text>
              <Text style={styles.blockLabel}>{block.label}</Text>
            </View>
            {i < blocks.length - 1 && <Text style={styles.separator}>:</Text>}
          </React.Fragment>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.fashionBlack,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.fashionGold,
    marginBottom: spacing.sm,
    letterSpacing: 2,
  },
  blocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  block: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 52,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  blockLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.fashionGold,
    letterSpacing: 1,
    marginTop: 2,
  },
  separator: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.fashionGold,
  },
  expiredContainer: {
    backgroundColor: colors.terracotta,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  expiredText: {
    ...typography.h3,
    color: colors.white,
    letterSpacing: 4,
  },
});
