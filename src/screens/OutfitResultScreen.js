/**
 * OutfitResultScreen — Display generated outfit combinations as cards
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import COLORS from '../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/config';
import { useCloset } from '../hooks/useCloset';
import { useOutfits } from '../hooks/useOutfits';
import OutfitCard from '../components/OutfitCard';
import EmptyState from '../components/EmptyState';

export default function OutfitResultScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { outfits: initialOutfits } = route.params || { outfits: [] };
  const { items } = useCloset();
  const { generate, save, savedOutfits, loadSaved, shuffle } = useOutfits(items);

  const [outfits, setOutfits] = useState(initialOutfits || []);
  const [savedIds, setSavedIds] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleSave = async (outfit) => {
    if (savedIds.has(outfit.id)) return;
    try {
      setSaving(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await save(outfit);
      setSavedIds(prev => new Set([...prev, outfit.id]));
    } catch (error) {
      Alert.alert('Error', 'Failed to save outfit.');
    } finally {
      setSaving(false);
    }
  };

  const handleShuffle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newOutfit = shuffle();
    if (newOutfit) {
      setOutfits(prev => [newOutfit, ...prev.slice(0, 4)]);
    }
  };

  const handleRegenerateAll = async () => {
    const { outfitOptions } = route.params || {};
    const newOutfits = await generate(outfitOptions);
    setOutfits(newOutfits);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>✨ Outfit Ideas</Text>
        <TouchableOpacity onPress={handleShuffle} style={styles.shuffleButton}>
          <Text style={styles.shuffleButtonText}>🔀 Shuffle</Text>
        </TouchableOpacity>
      </View>

      {/* Results count */}
      <View style={styles.resultBar}>
        <Text style={styles.resultText}>{outfits.length} outfit{outfits.length !== 1 ? 's' : ''} generated</Text>
        <TouchableOpacity onPress={handleRegenerateAll}>
          <Text style={styles.regenerateText}>↻ Regenerate</Text>
        </TouchableOpacity>
      </View>

      {outfits.length === 0 ? (
        <EmptyState
          emoji="🤔"
          title="No outfits generated"
          description="We couldn't find matching combinations. Try different filters or add more items to your closet."
          actionLabel="← Go Back"
          onAction={() => navigation.goBack()}
        />
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: outfit }) => (
            <OutfitCard
              outfit={outfit}
              onPress={(o) => {}}
              onSave={handleSave}
              onFavorite={() => {}}
              isSaved={savedIds.has(outfit.id)}
            />
          )}
          ListFooterComponent={
            <TouchableOpacity style={styles.viewSavedButton} onPress={() => navigation.navigate('SavedOutfits')}>
              <Text style={styles.viewSavedButtonText}>❤️ View Saved Outfits</Text>
            </TouchableOpacity>
          }
        />
      )}
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingVertical: SPACING.xs,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  shuffleButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryTransparent,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  shuffleButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primaryDark,
  },
  resultBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  resultText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  regenerateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['3xl'],
  },
  viewSavedButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    marginTop: SPACING.sm,
  },
  viewSavedButtonText: {
    color: COLORS.accentDark,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
