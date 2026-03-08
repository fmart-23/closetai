/**
 * ClosetScreen — Grid gallery of all clothing items with filters, search, and sort
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import COLORS from '../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/config';
import { useCloset } from '../hooks/useCloset';
import ClothingCard from '../components/ClothingCard';
import FilterChips from '../components/FilterChips';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { CLOTHING_CATEGORIES } from '../constants/categories';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.base * 3) / 2;

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'name', label: 'Name' },
  { id: 'type', label: 'Type' },
  { id: 'most_worn', label: 'Most Worn' },
];

export default function ClosetScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    filteredItems,
    loading,
    refreshing,
    filters,
    sortBy,
    stats,
    refresh,
    updateFilter,
    setSortBy,
  } = useCloset();

  const [showSortMenu, setShowSortMenu] = useState(false);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const renderItem = ({ item }) => (
    <ClothingCard
      item={item}
      onPress={(item) => navigation.navigate('ItemDetail', { itemId: item.id })}
    />
  );

  const renderEmpty = () => {
    if (loading) return <LoadingSpinner message="Loading your closet..." />;
    if (filters.searchQuery || filters.category !== 'all') {
      return (
        <EmptyState
          emoji="🔍"
          title="No items found"
          description="Try adjusting your filters or search term."
          actionLabel="Clear Filters"
          onAction={() => {
            updateFilter('category', 'all');
            updateFilter('searchQuery', '');
          }}
        />
      );
    }
    return (
      <EmptyState
        emoji="👗"
        title="Your closet is empty"
        description="Start scanning your clothes to build your digital wardrobe!"
        actionLabel="📷 Scan First Item"
        onAction={() => navigation.navigate('Scan')}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Closet</Text>
          <Text style={styles.subtitle}>{stats.total} items</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Scan')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, type, color..."
          placeholderTextColor={COLORS.textTertiary}
          value={filters.searchQuery}
          onChangeText={(text) => updateFilter('searchQuery', text)}
          returnKeyType="search"
        />
        {filters.searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => updateFilter('searchQuery', '')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <FilterChips
        filters={CLOTHING_CATEGORIES}
        selected={filters.category}
        onSelect={(cat) => updateFilter('category', cat)}
      />

      {/* Sort + Count bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
          activeOpacity={0.7}
        >
          <Text style={styles.sortButtonText}>↕ {SORT_OPTIONS.find(s => s.id === sortBy)?.label}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[styles.sortMenuItem, sortBy === option.id && styles.sortMenuItemActive]}
              onPress={() => { setSortBy(option.id); setShowSortMenu(false); }}
            >
              <Text style={[styles.sortMenuItemText, sortBy === option.id && styles.sortMenuItemTextActive]}>
                {option.label}
              </Text>
              {sortBy === option.id && <Text style={styles.sortMenuCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Items Grid */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          filteredItems.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  addButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: TYPOGRAPHY.fontWeight.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearButtonText: {
    color: COLORS.textTertiary,
    fontSize: 14,
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  resultCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  sortButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  sortButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  sortMenu: {
    position: 'absolute',
    top: 170,
    right: SPACING.base,
    zIndex: 100,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  sortMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  sortMenuItemActive: {
    backgroundColor: COLORS.primaryTransparent,
  },
  sortMenuItemText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  sortMenuItemTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  sortMenuCheck: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  columnWrapper: {
    paddingHorizontal: SPACING.base,
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: SPACING['3xl'],
    paddingTop: SPACING.sm,
  },
  listContentEmpty: {
    flex: 1,
  },
});
