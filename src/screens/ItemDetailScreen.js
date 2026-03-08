/**
 * ItemDetailScreen — Full item view with all attributes, edit/delete, and similar items
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import COLORS from '../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/config';
import { useCloset } from '../hooks/useCloset';
import ClothingCard from '../components/ClothingCard';
import { getClothingType, toTitleCase, formatDate } from '../utils/helpers';
import { getColorHex } from '../services/colorDetector';
import { findSimilarItems } from '../services/outfitEngine';

const { width } = Dimensions.get('window');

export default function ItemDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { itemId } = route.params || {};
  const { items, removeItem, wearItem, getItem } = useCloset();

  const item = getItem(itemId);
  const similarItems = item ? findSimilarItems(item, items, 4) : [];

  if (!item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.notFound}>Item not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBack}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const clothingType = getClothingType(item.type);
  const colorHex = getColorHex(item.color);

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to remove "${item.name || toTitleCase(item.type)}" from your closet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await removeItem(itemId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ]
    );
  };

  const handleWear = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await wearItem(itemId);
    Alert.alert('👗 Worn!', 'Wear count updated.');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={[styles.heroContainer, { paddingTop: insets.top }]}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroEmoji}>{clothingType?.emoji || '👔'}</Text>
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + SPACING.md }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          {/* Color dot */}
          <View style={[styles.colorBadge, { backgroundColor: colorHex }]}>
            <Text style={styles.colorBadgeLabel}>{toTitleCase(item.color)}</Text>
          </View>
        </View>

        {/* Item Details */}
        <View style={styles.detailsContainer}>
          {/* Name and type */}
          <View style={styles.nameRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.itemName}>{item.name || toTitleCase(item.type)}</Text>
              <Text style={styles.itemType}>{clothingType?.label}</Text>
            </View>
            <View style={styles.wearCountBadge}>
              <Text style={styles.wearCountNumber}>{item.wearCount || 0}</Text>
              <Text style={styles.wearCountLabel}>wears</Text>
            </View>
          </View>

          {/* Attribute chips */}
          <View style={styles.attributesRow}>
            <AttributeChip label={toTitleCase(item.style)} icon="🎨" />
            <AttributeChip label={toTitleCase(item.season)} icon="🌍" />
            <AttributeChip label={toTitleCase(item.pattern)} icon="✨" />
          </View>

          {/* Details table */}
          <View style={styles.detailsTable}>
            <DetailRow label="Type" value={clothingType?.label || toTitleCase(item.type)} />
            <DetailRow label="Color" value={toTitleCase(item.color)} colorDot={colorHex} />
            <DetailRow label="Pattern" value={toTitleCase(item.pattern)} />
            <DetailRow label="Style" value={toTitleCase(item.style)} />
            <DetailRow label="Season" value={toTitleCase(item.season)} />
            {item.brand && <DetailRow label="Brand" value={item.brand} />}
            <DetailRow label="Added" value={formatDate(item.createdAt)} />
            {item.lastWornAt && <DetailRow label="Last Worn" value={formatDate(item.lastWornAt)} />}
          </View>

          {/* Notes */}
          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.wearButton} onPress={handleWear} activeOpacity={0.8}>
              <Text style={styles.wearButtonText}>👗 Mark as Worn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
              <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Similar Items */}
          {similarItems.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.sectionTitle}>Similar Items</Text>
              <View style={styles.similarGrid}>
                {similarItems.map(si => (
                  <ClothingCard
                    key={si.id}
                    item={si}
                    style={styles.similarCard}
                    onPress={(i) => navigation.push('ItemDetail', { itemId: i.id })}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function AttributeChip({ label, icon }) {
  if (!label || label === 'Undefined') return null;
  return (
    <View style={styles.attributeChip}>
      {icon && <Text style={styles.attributeChipIcon}>{icon}</Text>}
      <Text style={styles.attributeChipText}>{label}</Text>
    </View>
  );
}

function DetailRow({ label, value, colorDot }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueContainer}>
        {colorDot && (
          <View style={[styles.colorDot, { backgroundColor: colorDot }]} />
        )}
        <Text style={styles.detailValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING['3xl'],
  },
  heroContainer: {
    width: '100%',
    height: width * 1.1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceAlt,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 80,
  },
  backButton: {
    position: 'absolute',
    left: SPACING.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.whiteTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: 32,
    marginTop: -2,
  },
  colorBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBadgeLabel: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  detailsContainer: {
    padding: SPACING.base,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  nameContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  itemType: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  wearCountBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryTransparent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginLeft: SPACING.base,
  },
  wearCountNumber: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  wearCountLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primaryDark,
  },
  attributesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  attributeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attributeChipIcon: {
    fontSize: 12,
  },
  attributeChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  detailsTable: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  notesContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  notesLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.xs,
  },
  notesText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  wearButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  wearButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  deleteButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  similarSection: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  similarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  similarCard: {
    width: (width - SPACING.base * 2 - SPACING.sm) / 2,
  },
  notFound: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  goBack: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
