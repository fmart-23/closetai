/**
 * SavedOutfitsScreen — Gallery of saved outfit combinations
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import COLORS from '../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/config';
import { useCloset } from '../hooks/useCloset';
import { useOutfits } from '../hooks/useOutfits';
import OutfitCard from '../components/OutfitCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SavedOutfitsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { items } = useCloset();
  const {
    savedOutfits,
    savedLoading,
    refreshing,
    loadSaved,
    deleteSaved,
    toggleFavorite,
    refresh,
  } = useOutfits(items);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleDelete = (outfitId) => {
    Alert.alert(
      'Remove Outfit',
      'Remove this outfit from your saved outfits?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await deleteSaved(outfitId);
          },
        },
      ]
    );
  };

  const handleFavorite = async (outfitId) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleFavorite(outfitId);
  };

  const renderEmpty = () => {
    if (savedLoading) return <LoadingSpinner message="Loading saved outfits..." />;
    return (
      <EmptyState
        emoji="❤️"
        title="No saved outfits yet"
        description="Generate outfit suggestions and save your favorites here!"
        actionLabel="✨ Generate Outfits"
        onAction={() => navigation.navigate('OutfitMain')}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>❤️ Saved Outfits</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{savedOutfits.length}</Text>
        </View>
      </View>

      <FlatList
        data={savedOutfits}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, savedOutfits.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={COLORS.primary}
          />
        }
        renderItem={({ item: outfit }) => (
          <View style={styles.outfitWrapper}>
            <OutfitCard
              outfit={outfit}
              onFavorite={() => handleFavorite(outfit.id)}
              isSaved
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(outfit.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
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
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.accentTransparent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.accentDark,
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['3xl'],
  },
  listEmpty: {
    flex: 1,
  },
  outfitWrapper: {
    marginBottom: SPACING.xs,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
