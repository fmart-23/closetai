/**
 * HomeScreen — Dashboard with closet stats, recent items, and outfit of the day
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import COLORS from '../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/config';
import { useCloset } from '../hooks/useCloset';
import { useOutfits } from '../hooks/useOutfits';
import ClothingCard from '../components/ClothingCard';
import OutfitCard from '../components/OutfitCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { toTitleCase } from '../utils/helpers';
import { CLOTHING_CATEGORIES } from '../constants/categories';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { items, loading, stats, refresh } = useCloset();
  const { getToday, save } = useOutfits(items);

  const todayOutfit = getToday();
  const recentItems = items.slice(0, 6);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const getCategoryIcon = (categoryId) => {
    const cat = CLOTHING_CATEGORIES.find(c => c.id === categoryId);
    return cat?.icon || '👔';
  };

  const topCategories = Object.entries(stats.byCategory || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getGreeting()} 👋</Text>
            <Text style={styles.tagline}>Your style, organized.</Text>
          </View>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate('Scan')}
            activeOpacity={0.8}
          >
            <Text style={styles.scanButtonIcon}>📷</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatCard
            emoji="👗"
            label="Total Items"
            value={stats.total}
            color={COLORS.primary}
            onPress={() => navigation.navigate('Closet')}
          />
          {topCategories.slice(0, 2).map(([category, count]) => (
            <StatCard
              key={category}
              emoji={getCategoryIcon(category)}
              label={toTitleCase(category)}
              value={count}
              color={COLORS.categories[category] || COLORS.accent}
              onPress={() => navigation.navigate('Closet')}
            />
          ))}
        </View>

        {/* Outfit of the Day */}
        {todayOutfit && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✨ Outfit of the Day</Text>
            </View>
            <OutfitCard
              outfit={todayOutfit}
              onPress={() => navigation.navigate('Outfits', {
                screen: 'OutfitResult',
                params: { outfits: [todayOutfit] }
              })}
              onSave={() => save(todayOutfit)}
            />
          </View>
        )}

        {/* Recent Additions */}
        {recentItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Added</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Closet')}>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={recentItems}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
              renderItem={({ item }) => (
                <ClothingCard
                  item={item}
                  style={styles.recentCard}
                  onPress={() => navigation.navigate('Closet', {
                    screen: 'ItemDetail',
                    params: { itemId: item.id }
                  })}
                />
              )}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              emoji="📷"
              label="Scan Item"
              description="Add clothing with camera"
              onPress={() => navigation.navigate('Scan')}
            />
            <QuickAction
              emoji="✨"
              label="Get Outfit"
              description="AI-powered suggestions"
              onPress={() => navigation.navigate('Outfits')}
            />
            <QuickAction
              emoji="👗"
              label="My Closet"
              description="Browse all items"
              onPress={() => navigation.navigate('Closet')}
            />
            <QuickAction
              emoji="❤️"
              label="Saved Outfits"
              description="Your favorites"
              onPress={() => navigation.navigate('Outfits', { screen: 'SavedOutfits' })}
            />
          </View>
        </View>

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👗</Text>
            <Text style={styles.emptyTitle}>Your closet is empty!</Text>
            <Text style={styles.emptyDescription}>
              Start by scanning your first clothing item to build your digital wardrobe.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Scan')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>📷 Scan First Item</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && <LoadingSpinner message="Loading your closet..." />}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ emoji, label, value, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.statCard, { borderTopColor: color }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickAction({ emoji, label, description, onPress }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.quickActionEmoji}>{emoji}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
      <Text style={styles.quickActionDesc}>{description}</Text>
    </TouchableOpacity>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.lg,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  tagline: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  scanButtonIcon: {
    fontSize: 22,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderTopWidth: 3,
    ...SHADOWS.sm,
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  seeAllButton: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  recentList: {
    paddingRight: SPACING.base,
    gap: SPACING.sm,
  },
  recentCard: {
    width: 150,
    marginBottom: 0,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  quickAction: {
    width: (width - SPACING.base * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  quickActionEmoji: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  quickActionDesc: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['2xl'],
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: SPACING.base,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.md,
  },
  emptyButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
