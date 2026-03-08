/**
 * CategoryPicker — Clothing category/type selection component
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
import { CLOTHING_TYPES, CLOTHING_CATEGORIES } from '../constants/categories';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/config';

export default function CategoryPicker({ selectedCategory, selectedType, onSelectType, style }) {
  const [activeCategory, setActiveCategory] = React.useState(selectedCategory || 'tops');

  const typesInCategory = CLOTHING_TYPES.filter(t => t.category === activeCategory);

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {CLOTHING_CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryTab, isActive && styles.categoryTabActive]}
              onPress={() => handleCategorySelect(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Type grid */}
      <View style={styles.typesGrid}>
        {typesInCategory.map((type) => {
          const isSelected = selectedType === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
              onPress={() => onSelectType?.(type.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.typeEmoji}>{type.emoji}</Text>
              <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  categoryLabelActive: {
    color: COLORS.textOnPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.base,
    gap: SPACING.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.primaryTransparent,
    borderColor: COLORS.primary,
  },
  typeEmoji: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  typeLabelSelected: {
    color: COLORS.primaryDark,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
