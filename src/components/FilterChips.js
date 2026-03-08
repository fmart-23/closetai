/**
 * FilterChips — Horizontal scrollable filter chips
 */
import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import COLORS from '../constants/colors';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/config';

export default function FilterChips({ filters, selected, onSelect, style }) {
  if (!filters || filters.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {filters.map((filter) => {
        const isSelected = selected === filter.id;
        return (
          <TouchableOpacity
            key={filter.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect?.(filter.id)}
            activeOpacity={0.7}
          >
            {filter.icon && (
              <Text style={styles.chipIcon}>{filter.icon}</Text>
            )}
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  chipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.textOnPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
