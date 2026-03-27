import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

const SIZE_DATA = {
  XS: { chest: '80-84', waist: '60-64' },
  S: { chest: '84-88', waist: '64-68' },
  M: { chest: '88-92', waist: '68-72' },
  L: { chest: '92-96', waist: '72-76' },
  XL: { chest: '96-100', waist: '76-80' },
};

export default function SizeSelector({ sizes = ['S', 'M', 'L'], fitType, modelInfo, onSelect }) {
  const [selected, setSelected] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleSelect = (size) => {
    setSelected(size);
    onSelect?.(size);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Size & Fit</Text>
        <TouchableOpacity onPress={() => setShowGuide(!showGuide)}>
          <Text style={styles.guideLink}>Size guide</Text>
        </TouchableOpacity>
      </View>

      {/* Fit Type */}
      {fitType && (
        <View style={styles.fitRow}>
          <View style={styles.fitDot} />
          <Text style={styles.fitText}>{fitType} fit</Text>
        </View>
      )}

      {/* Size Buttons */}
      <View style={styles.sizeRow}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.sizeButton, selected === size && styles.sizeActive]}
            onPress={() => handleSelect(size)}
          >
            <Text style={[styles.sizeText, selected === size && styles.sizeTextActive]}>
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Model Info */}
      {modelInfo && (
        <View style={styles.modelInfo}>
          <Text style={styles.modelLabel}>Model is wearing</Text>
          <Text style={styles.modelDetails}>
            Size {modelInfo.size} · {modelInfo.height} · {modelInfo.measurements}
          </Text>
        </View>
      )}

      {/* Size Guide */}
      {showGuide && (
        <View style={styles.guide}>
          <Text style={styles.guideTitle}>Size Guide (cm)</Text>
          {Object.entries(SIZE_DATA).map(([size, data]) => (
            <View
              key={size}
              style={[styles.guideRow, sizes.includes(size) && styles.guideRowAvailable]}
            >
              <Text style={[styles.guideSize, sizes.includes(size) && styles.guideSizeAvailable]}>
                {size}
              </Text>
              <Text style={styles.guideMeasure}>Chest: {data.chest}</Text>
              <Text style={styles.guideMeasure}>Waist: {data.waist}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  guideLink: {
    ...typography.bodySmall,
    color: colors.terracotta,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  fitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  fitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.olive,
  },
  fitText: {
    ...typography.body,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  sizeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  sizeActive: {
    borderColor: colors.fashionBlack,
    backgroundColor: colors.fashionBlack,
  },
  sizeText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sizeTextActive: {
    color: colors.white,
  },
  modelInfo: {
    backgroundColor: colors.beigeLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  modelLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: 2,
  },
  modelDetails: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  guide: {
    marginTop: spacing.md,
    backgroundColor: colors.beigeLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  guideTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  guideRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    gap: spacing.md,
    opacity: 0.4,
  },
  guideRowAvailable: {
    opacity: 1,
  },
  guideSize: {
    width: 30,
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textLight,
  },
  guideSizeAvailable: {
    color: colors.textPrimary,
  },
  guideMeasure: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
