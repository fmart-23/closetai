import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import Colors from '../constants/colors';
import { outfitsAPI } from '../services/api';
import { capitalize, getCategoryIcon } from '../utils/helpers';
import { API_URL } from '../constants/config';

export default function OutfitResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { outfit, preferences, readOnly = false } = route.params;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(readOnly);
  const [regenerating, setRegenerating] = useState(false);

  const items = outfit.items || [];

  // ---- Save outfit ----
  const handleSave = async () => {
    setSaving(true);
    try {
      await outfitsAPI.save({
        name: outfit.name || `${capitalize(preferences?.occasion || 'Outfit')} Look`,
        occasion: preferences?.occasion || outfit.occasion,
        style: preferences?.style || outfit.style,
        description: outfit.description,
        items: items.map((i) => i.id),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);
      Alert.alert('Saved! 🎉', 'This outfit has been added to your saved looks.');
    } catch (err) {
      Alert.alert('Save failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- Regenerate ----
  const handleRegenerate = async () => {
    if (!preferences) return;
    setRegenerating(true);
    try {
      const result = await outfitsAPI.recommend(preferences);
      navigation.replace('OutfitResult', { outfit: result, preferences });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Outfit name header */}
        <LinearGradient
          colors={Colors.gradientPurple}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.outfitName}>
            {outfit.name || 'Your Outfit'}
          </Text>
          <View style={styles.tagRow}>
            {outfit.occasion ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{capitalize(outfit.occasion)}</Text>
              </View>
            ) : null}
            {outfit.style ? (
              <View style={[styles.tag, styles.tagPink]}>
                <Text style={styles.tagText}>{capitalize(outfit.style)}</Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* Description */}
        {outfit.description ? (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>✨ Styling Notes</Text>
            <Text style={styles.descriptionText}>{outfit.description}</Text>
          </View>
        ) : null}

        {/* Tips */}
        {outfit.tips ? (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Tips</Text>
            <Text style={styles.tipsText}>{outfit.tips}</Text>
          </View>
        ) : null}

        {/* Items section */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>
            {items.length} {items.length === 1 ? 'Piece' : 'Pieces'}
          </Text>

          <View style={styles.itemsGrid}>
            {items.map((item, idx) => {
              const uri = item.image_url
                ? item.image_url.startsWith('http')
                  ? item.image_url
                  : `${API_URL}${item.image_url}`
                : null;
              return (
                <View key={item.id ?? idx} style={styles.itemCard}>
                  {uri ? (
                    <Image
                      source={{ uri }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Text style={{ fontSize: 36 }}>
                        {getCategoryIcon(item.category)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name || capitalize(item.category || 'Item')}
                    </Text>
                    {item.color ? (
                      <Text style={styles.itemDetail}>{capitalize(item.color)}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        {!readOnly && !saved && (
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <View style={styles.btnRow}>
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={styles.saveBtnText}>Saving…</Text>
              </View>
            ) : (
              <Text style={styles.saveBtnText}>💾 Save Outfit</Text>
            )}
          </TouchableOpacity>
        )}

        {saved && !regenerating && (
          <View style={styles.savedBadge}>
            <Text style={styles.savedBadgeText}>✅ Saved to your outfits</Text>
          </View>
        )}

        {!readOnly && (
          <TouchableOpacity
            style={[styles.regenBtn, regenerating && styles.btnDisabled]}
            onPress={handleRegenerate}
            disabled={regenerating}
            activeOpacity={0.85}
          >
            {regenerating ? (
              <View style={styles.btnRow}>
                <ActivityIndicator color={Colors.primary} size="small" />
                <Text style={styles.regenBtnText}>Generating…</Text>
              </View>
            ) : (
              <Text style={styles.regenBtnText}>🔄 Regenerate</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },

  headerGradient: {
    padding: 24,
    gap: 12,
  },
  outfitName: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagPink: {
    backgroundColor: Colors.secondary + '40',
  },
  tagText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  descriptionCard: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  descriptionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  tipsCard: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  tipsTitle: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
  tipsText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  itemsSection: {
    margin: 16,
    gap: 14,
  },
  itemsTitle: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1,
  },
  itemImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    padding: 10,
    gap: 3,
  },
  itemName: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  itemDetail: {
    color: Colors.textMuted,
    fontSize: 11,
  },

  bottomBar: {
    padding: 16,
    gap: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  savedBadge: {
    backgroundColor: Colors.successBg,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  savedBadgeText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  regenBtn: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnDisabled: { opacity: 0.6 },
  regenBtnText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
