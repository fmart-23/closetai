import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Colors from '../constants/colors';
import { capitalize, getColorHex, truncateText, getCategoryIcon } from '../utils/helpers';
import { API_URL } from '../constants/config';

/**
 * ClothingCard — grid card for a single clothing item.
 *
 * Props:
 *   item    — clothing item object from the API
 *   onPress — callback when the card is tapped
 */
export default function ClothingCard({ item, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  // Build full image URL if the path is relative
  const imageUri = item.image_url
    ? item.image_url.startsWith('http')
      ? item.image_url
      : `${API_URL}${item.image_url}`
    : null;

  const colorHex = getColorHex(item.color);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>
                {getCategoryIcon(item.category)}
              </Text>
            </View>
          )}

          {/* Season badge */}
          {item.season && (
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonText}>{item.season}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {truncateText(item.name || capitalize(item.category), 22)}
          </Text>

          <View style={styles.meta}>
            {/* Color dot */}
            <View style={[styles.colorDot, { backgroundColor: colorHex }]} />
            {/* Category chip */}
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>
                {capitalize(item.category)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  seasonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(108,60,225,0.85)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  seasonText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  info: {
    padding: 10,
    gap: 6,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChip: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
});
