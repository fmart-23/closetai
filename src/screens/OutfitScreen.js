/**
 * OutfitScreen — Generate outfit suggestions with occasion/style/season selectors
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import COLORS from '../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/config';
import { useCloset } from '../hooks/useCloset';
import { useOutfits } from '../hooks/useOutfits';
import EmptyState from '../components/EmptyState';
import { OCCASIONS, WEATHER, STYLES } from '../constants/categories';

export default function OutfitScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { items } = useCloset();
  const { generate, outfitOptions, updateOptions, loading } = useOutfits(items);

  const handleGenerate = async () => {
    if (items.length < 2) {
      return;
    }
    const outfits = await generate(outfitOptions);
    navigation.navigate('OutfitResult', { outfits });
  };

  const hasEnoughItems = items.length >= 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>✨ Outfit Generator</Text>
        <TouchableOpacity
          style={styles.savedButton}
          onPress={() => navigation.navigate('SavedOutfits')}
          activeOpacity={0.7}
        >
          <Text style={styles.savedButtonText}>❤️ Saved</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {!hasEnoughItems ? (
          <EmptyState
            emoji="👗"
            title="Add more clothes first"
            description="You need at least 2 items in your closet to generate outfit suggestions."
            actionLabel="📷 Scan Items"
            onAction={() => navigation.navigate('Scan')}
          />
        ) : (
          <>
            {/* Occasion Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Occasion</Text>
              <Text style={styles.sectionSubtitle}>What's the occasion?</Text>
              <View style={styles.optionGrid}>
                {OCCASIONS.map(occ => (
                  <OptionCard
                    key={occ.id}
                    item={occ}
                    selected={outfitOptions.occasion === occ.id}
                    onSelect={() => updateOptions('occasion', occ.id)}
                  />
                ))}
              </View>
            </View>

            {/* Weather Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌤️ Weather</Text>
              <Text style={styles.sectionSubtitle}>What's the weather like?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {WEATHER.map(w => (
                  <WeatherChip
                    key={w.id}
                    item={w}
                    selected={outfitOptions.weather === w.id}
                    onSelect={() => updateOptions('weather', w.id)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Style Preference */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎨 Style Preference</Text>
              <Text style={styles.sectionSubtitle}>Optional: prefer a specific style?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                <TouchableOpacity
                  style={[styles.styleChip, !outfitOptions.stylePreference && styles.styleChipSelected]}
                  onPress={() => updateOptions('stylePreference', null)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.styleChipText, !outfitOptions.stylePreference && styles.styleChipTextSelected]}>Any Style</Text>
                </TouchableOpacity>
                {STYLES.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.styleChip, outfitOptions.stylePreference === s.id && styles.styleChipSelected]}
                    onPress={() => updateOptions('stylePreference', s.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.styleChipIcon}>{s.icon}</Text>
                    <Text style={[styles.styleChipText, outfitOptions.stylePreference === s.id && styles.styleChipTextSelected]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Closet summary */}
            <View style={styles.closetSummary}>
              <Text style={styles.closetSummaryText}>
                🗂️ Generating from {items.length} items in your closet
              </Text>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[styles.generateButton, loading && styles.generateButtonDisabled]}
              onPress={handleGenerate}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.generateButtonText}>
                {loading ? '⏳ Generating...' : '✨ Generate Outfits'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function OptionCard({ item, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={styles.optionIcon}>{item.icon}</Text>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{item.label}</Text>
      <Text style={styles.optionDesc} numberOfLines={1}>{item.description}</Text>
    </TouchableOpacity>
  );
}

function WeatherChip({ item, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.weatherChip, selected && styles.weatherChipSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={styles.weatherIcon}>{item.icon}</Text>
      <Text style={[styles.weatherLabel, selected && styles.weatherLabelSelected]}>{item.label}</Text>
      <Text style={styles.weatherTemp}>{item.temp}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  savedButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accentTransparent,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  savedButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.accentDark,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['3xl'],
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
    ...SHADOWS.sm,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryTransparent,
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: COLORS.primaryDark,
  },
  optionDesc: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  horizontalScroll: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  weatherChip: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minWidth: 90,
    ...SHADOWS.sm,
  },
  weatherChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryTransparent,
  },
  weatherIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  weatherLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  weatherLabelSelected: {
    color: COLORS.primaryDark,
  },
  weatherTemp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  styleChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  styleChipIcon: {
    fontSize: 14,
  },
  styleChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  styleChipTextSelected: {
    color: COLORS.textOnPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  closetSummary: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  closetSummaryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
