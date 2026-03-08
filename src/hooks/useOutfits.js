/**
 * Custom hook for managing outfit suggestions and saved outfits
 */
import { useState, useCallback } from 'react';
import {
  loadSavedOutfits,
  saveOutfit,
  deleteSavedOutfit,
  toggleOutfitFavorite,
} from '../services/storage';
import {
  generateOutfits,
  getRandomOutfit,
  getDailyOutfit,
} from '../services/outfitEngine';

export function useOutfits(closetItems = []) {
  const [generatedOutfits, setGeneratedOutfits] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [outfitOptions, setOutfitOptions] = useState({
    occasion: 'casual',
    weather: 'mild',
    stylePreference: null,
  });

  // Generate outfit suggestions
  const generate = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const opts = { ...outfitOptions, ...options, maxOutfits: 6 };
      const outfits = generateOutfits(closetItems, opts);
      setGeneratedOutfits(outfits);
      return outfits;
    } catch (err) {
      setError(err.message || 'Failed to generate outfits');
      return [];
    } finally {
      setLoading(false);
    }
  }, [closetItems, outfitOptions]);

  // Shuffle / get a random new outfit
  const shuffle = useCallback(() => {
    const outfit = getRandomOutfit(closetItems, outfitOptions);
    if (outfit) {
      setGeneratedOutfits(prev => [outfit, ...prev.slice(0, 5)]);
    }
    return outfit;
  }, [closetItems, outfitOptions]);

  // Get today's featured outfit
  const getToday = useCallback(() => {
    return getDailyOutfit(closetItems);
  }, [closetItems]);

  // Load saved outfits
  const loadSaved = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setSavedLoading(true);

      const saved = await loadSavedOutfits();
      setSavedOutfits(saved);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load saved outfits');
    } finally {
      setSavedLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Save an outfit
  const save = useCallback(async (outfit) => {
    try {
      const saved = await saveOutfit(outfit);
      setSavedOutfits(prev => [saved, ...prev]);
      return saved;
    } catch (err) {
      setError(err.message || 'Failed to save outfit');
      throw err;
    }
  }, []);

  // Delete a saved outfit
  const deleteSaved = useCallback(async (outfitId) => {
    try {
      await deleteSavedOutfit(outfitId);
      setSavedOutfits(prev => prev.filter(o => o.id !== outfitId));
    } catch (err) {
      setError(err.message || 'Failed to delete outfit');
      throw err;
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (outfitId) => {
    try {
      const updated = await toggleOutfitFavorite(outfitId);
      setSavedOutfits(prev =>
        prev.map(o => o.id === outfitId ? { ...o, isFavorite: !o.isFavorite } : o)
      );
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to toggle favorite');
    }
  }, []);

  // Update outfit generation options
  const updateOptions = useCallback((key, value) => {
    setOutfitOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Refresh saved outfits
  const refresh = useCallback(() => {
    loadSaved(true);
  }, [loadSaved]);

  return {
    generatedOutfits,
    savedOutfits,
    loading,
    savedLoading,
    refreshing,
    error,
    outfitOptions,
    generate,
    shuffle,
    getToday,
    loadSaved,
    save,
    deleteSaved,
    toggleFavorite,
    updateOptions,
    refresh,
  };
}

export default useOutfits;
