import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import Colors from '../constants/colors';
import { outfitsAPI } from '../services/api';
import OutfitCard from '../components/OutfitCard';
import EmptyState from '../components/EmptyState';

// ---------------------------------------------------------------------------
// Selector section — a label + horizontal chip row
// ---------------------------------------------------------------------------
function SelectorSection({ label, options, selected, onSelect }) {
  return (
    <View style={styles.selectorSection}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorRow}
      >
        {options.map((opt) => {
          const isSelected = opt === selected;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// OutfitScreen
// ---------------------------------------------------------------------------
const OCCASIONS = ['Casual', 'Work', 'Date Night', 'Formal', 'Gym', 'Weekend'];
const WEATHER = ['Hot', 'Warm', 'Cool', 'Cold', 'Rainy'];
const STYLE_PREFS = ['Classic', 'Trendy', 'Minimalist', 'Bold', 'Sporty'];

export default function OutfitScreen() {
  const navigation = useNavigation();

  const [occasion, setOccasion] = useState('Casual');
  const [weather, setWeather] = useState('Warm');
  const [stylePref, setStylePref] = useState('Classic');
  const [generating, setGenerating] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loadingOutfits, setLoadingOutfits] = useState(true);

  // ---- Load saved outfits ----
  const loadSavedOutfits = useCallback(async () => {
    try {
      const data = await outfitsAPI.getAll();
      setSavedOutfits(data);
    } catch {
      // silently fail
    } finally {
      setLoadingOutfits(false);
    }
  }, []);

  useEffect(() => {
    loadSavedOutfits();
  }, [loadSavedOutfits]);

  // Refresh when screen gets focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadSavedOutfits);
    return unsubscribe;
  }, [navigation, loadSavedOutfits]);

  // ---- Generate ----
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await outfitsAPI.recommend({
        occasion,
        weather,
        style: stylePref,
      });
      navigation.navigate('OutfitResult', { outfit: result, preferences: { occasion, weather, style: stylePref } });
    } catch (err) {
      Alert.alert('Generation failed', err.message || 'Could not generate outfit. Make sure you have clothing items in your closet.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>Outfit Generator</Text>
        <Text style={styles.subheading}>
          Tell us the vibe and we'll build your perfect look from your closet.
        </Text>

        {/* Selectors */}
        <View style={styles.selectorCard}>
          <SelectorSection
            label="🎯 Occasion"
            options={OCCASIONS}
            selected={occasion}
            onSelect={setOccasion}
          />
          <View style={styles.divider} />
          <SelectorSection
            label="🌡️ Weather"
            options={WEATHER}
            selected={weather}
            onSelect={setWeather}
          />
          <View style={styles.divider} />
          <SelectorSection
            label="💅 Style"
            options={STYLE_PREFS}
            selected={stylePref}
            onSelect={setStylePref}
          />
        </View>

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.btnDisabled]}
          onPress={handleGenerate}
          disabled={generating}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={Colors.gradientPurple}
            style={styles.generateBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {generating ? (
              <View style={styles.generatingRow}>
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={styles.generateBtnText}>Creating your outfit…</Text>
              </View>
            ) : (
              <Text style={styles.generateBtnText}>✨ Generate Outfit</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Saved outfits */}
        <View style={styles.savedSection}>
          <Text style={styles.savedTitle}>Saved Outfits</Text>
          {loadingOutfits ? (
            <View style={styles.savedLoading}>
              <ActivityIndicator color={Colors.primary} size="small" />
            </View>
          ) : savedOutfits.length === 0 ? (
            <EmptyState
              icon="✨"
              title="No saved outfits yet"
              subtitle="Generate an outfit and save it here!"
              fullScreen={false}
            />
          ) : (
            <View style={styles.savedList}>
              {savedOutfits.map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  onPress={() =>
                    navigation.navigate('OutfitResult', { outfit, readOnly: true })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },

  heading: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subheading: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },

  selectorCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  selectorSection: {
    paddingVertical: 12,
  },
  selectorLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  selectorRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 16,
  },

  generateBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 32 },
  btnDisabled: { opacity: 0.6 },
  generateBtnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  generateBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  savedSection: { gap: 14 },
  savedTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  savedLoading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  savedList: { gap: 12 },
});
