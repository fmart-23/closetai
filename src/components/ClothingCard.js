/**
 * ClothingCard — Grid card displaying a clothing item
 */
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import COLORS from '../constants/colors';
import { SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '../constants/config';
import { getClothingType, toTitleCase } from '../utils/helpers';
import { getColorHex } from '../services/colorDetector';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.base * 3) / 2;

export default function ClothingCard({ item, onPress, style }) {
  if (!item) return null;

  const clothingType = getClothingType(item.type);
  const colorHex = getColorHex(item.color);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.85}
    >
      {/* Item Image */}
      <View style={styles.imageContainer}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>{clothingType?.emoji || '👔'}</Text>
          </View>
        )}

        {/* Color dot */}
        {item.color && (
          <View style={[styles.colorDot, { backgroundColor: colorHex }]} />
        )}
      </View>

      {/* Item Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name || toTitleCase(item.type) || 'Item'}
        </Text>
        <Text style={styles.itemType} numberOfLines={1}>
          {clothingType?.label || toTitleCase(item.type)}
        </Text>

        {/* Tags row */}
        <View style={styles.tagsRow}>
          {item.style && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{toTitleCase(item.style)}</Text>
            </View>
          )}
          {item.season && item.season !== 'all' && (
            <View style={[styles.tag, styles.tagSecondary]}>
              <Text style={styles.tagText}>{toTitleCase(item.season)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.base,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    backgroundColor: COLORS.surfaceAlt,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  colorDot: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  infoContainer: {
    padding: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  itemName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemType: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  tag: {
    backgroundColor: COLORS.primaryTransparent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagSecondary: {
    backgroundColor: COLORS.accentTransparent,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primaryDark,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
