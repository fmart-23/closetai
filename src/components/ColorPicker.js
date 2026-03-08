/**
 * ColorPicker — Color selection component for clothing attributes
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import COLORS from '../constants/colors';
import { COLORS_LIST } from '../constants/categories';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '../constants/config';

export default function ColorPicker({ selected, onSelect, style }) {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {COLORS_LIST.map((color) => {
          const isSelected = selected === color.id;
          const isMulticolor = color.id === 'multicolor';

          return (
            <TouchableOpacity
              key={color.id}
              style={[styles.colorItem, isSelected && styles.colorItemSelected]}
              onPress={() => onSelect?.(color.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.colorSwatch,
                  isMulticolor
                    ? styles.multicolorSwatch
                    : { backgroundColor: color.hex },
                  color.id === 'white' && styles.lightBorder,
                  color.id === 'cream' && styles.lightBorder,
                  isSelected && styles.swatchSelected,
                ]}
              >
                {isMulticolor && (
                  <Text style={styles.multicolorText}>🌈</Text>
                )}
                {isSelected && !isMulticolor && (
                  <Text style={[styles.checkmark, { color: isLightColor(color.hex) ? '#333' : '#FFF' }]}>✓</Text>
                )}
              </View>
              <Text style={[styles.colorLabel, isSelected && styles.colorLabelSelected]}>
                {color.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function isLightColor(hex) {
  if (!hex || hex === '#GRADIENT') return false;
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  colorItem: {
    alignItems: 'center',
    width: 52,
  },
  colorItemSelected: {},
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lightBorder: {
    borderColor: COLORS.border,
    borderWidth: 1.5,
  },
  swatchSelected: {
    borderWidth: 2.5,
    borderColor: COLORS.primary,
  },
  multicolorSwatch: {
    backgroundColor: COLORS.surfaceAlt,
  },
  multicolorText: {
    fontSize: 20,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  colorLabelSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
