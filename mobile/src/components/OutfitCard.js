import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/colors';
import { capitalize, truncateText } from '../utils/helpers';
import { API_URL } from '../constants/config';

/**
 * OutfitCard — displays a saved or recommended outfit summary.
 *
 * Props:
 *   outfit  — outfit object { name, occasion, style, description, items: ClothingItem[] }
 *   onPress — optional tap handler
 */
export default function OutfitCard({ outfit, onPress }) {
  const itemImages = (outfit.items || []).slice(0, 4);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name} numberOfLines={1}>
            {truncateText(outfit.name || 'Outfit', 28)}
          </Text>
          <View style={styles.tags}>
            {outfit.occasion ? (
              <View style={styles.tagChip}>
                <Text style={styles.tagText}>{capitalize(outfit.occasion)}</Text>
              </View>
            ) : null}
            {outfit.style ? (
              <View style={[styles.tagChip, styles.tagChipSecondary]}>
                <Text style={[styles.tagText, styles.tagTextSecondary]}>
                  {capitalize(outfit.style)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>

      {/* Description */}
      {outfit.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {outfit.description}
        </Text>
      ) : null}

      {/* Item image thumbnails */}
      {itemImages.length > 0 && (
        <View style={styles.imageRow}>
          {itemImages.map((item, idx) => {
            const uri = item.image_url
              ? item.image_url.startsWith('http')
                ? item.image_url
                : `${API_URL}${item.image_url}`
              : null;
            return (
              <View key={item.id ?? idx} style={styles.thumbContainer}>
                {uri ? (
                  <Image
                    source={{ uri }}
                    style={styles.thumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <Text style={styles.thumbEmoji}>👕</Text>
                  </View>
                )}
              </View>
            );
          })}
          {/* Show "+N" if more than 4 items */}
          {(outfit.items || []).length > 4 && (
            <View style={[styles.thumbContainer, styles.moreContainer]}>
              <Text style={styles.moreText}>
                +{(outfit.items || []).length - 4}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: Colors.primary + '30',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagChipSecondary: {
    backgroundColor: Colors.secondary + '25',
  },
  tagText: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '600',
  },
  tagTextSecondary: {
    color: Colors.secondary,
  },
  arrow: {
    color: Colors.textMuted,
    fontSize: 22,
    marginLeft: 8,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  thumbContainer: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: {
    fontSize: 24,
  },
  moreContainer: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
