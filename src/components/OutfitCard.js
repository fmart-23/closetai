/**
 * OutfitCard — Card displaying an outfit combination
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

const { width } = Dimensions.get('window');

export default function OutfitCard({ outfit, onPress, onSave, onFavorite, isSaved, style }) {
  if (!outfit || !outfit.items) return null;

  const mainItems = outfit.items.slice(0, 4);
  const scorePercent = outfit.score || 70;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress?.(outfit)}
      activeOpacity={0.9}
    >
      {/* Outfit items grid */}
      <View style={styles.itemsGrid}>
        {mainItems.map((item, index) => {
          const clothingType = getClothingType(item.type);
          return (
            <View key={item.id || index} style={[styles.itemTile, index >= 2 && styles.smallTile]}>
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.itemPlaceholder}>
                  <Text style={styles.itemEmoji}>{clothingType?.emoji || '👔'}</Text>
                </View>
              )}
            </View>
          );
        })}
        {outfit.items.length > 4 && (
          <View style={styles.moreItemsBadge}>
            <Text style={styles.moreItemsText}>+{outfit.items.length - 4}</Text>
          </View>
        )}
      </View>

      {/* Outfit info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.tagsContainer}>
            {outfit.occasion && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{toTitleCase(outfit.occasion)}</Text>
              </View>
            )}
            {outfit.weather && (
              <View style={[styles.tag, styles.tagSecondary]}>
                <Text style={styles.tagText}>{toTitleCase(outfit.weather)}</Text>
              </View>
            )}
          </View>

          {/* Score badge */}
          <View style={[styles.scoreBadge, scorePercent >= 75 && styles.scoreBadgeGood]}>
            <Text style={styles.scoreText}>{scorePercent}%</Text>
          </View>
        </View>

        <Text style={styles.itemCount}>
          {outfit.items.length} piece{outfit.items.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        {onSave && (
          <TouchableOpacity
            style={[styles.actionButton, isSaved && styles.actionButtonActive]}
            onPress={() => onSave?.(outfit)}
          >
            <Text style={[styles.actionButtonText, isSaved && styles.actionButtonTextActive]}>
              {isSaved ? '✓ Saved' : '+ Save'}
            </Text>
          </TouchableOpacity>
        )}
        {onFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onFavorite?.(outfit)}
          >
            <Text style={styles.favoriteIcon}>{outfit.isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.base,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 180,
    overflow: 'hidden',
  },
  itemTile: {
    width: '50%',
    height: '100%',
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  smallTile: {
    width: '25%',
    height: '50%',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  itemEmoji: {
    fontSize: 28,
  },
  moreItemsBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.blackTransparent,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  moreItemsText: {
    color: COLORS.surface,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  infoContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.primaryTransparent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  tagSecondary: {
    backgroundColor: COLORS.accentTransparent,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primaryDark,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  scoreBadge: {
    backgroundColor: COLORS.accentTransparent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  scoreBadgeGood: {
    backgroundColor: '#C8E6CC',
  },
  scoreText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textSecondary,
  },
  itemCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  actionButtonTextActive: {
    color: COLORS.textOnPrimary,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 22,
  },
});
