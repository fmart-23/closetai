/**
 * Custom hook for managing closet items
 * Provides CRUD operations and filtering/sorting
 */
import { useState, useEffect, useCallback } from 'react';
import {
  loadClosetItems,
  saveClosetItem,
  updateClosetItem,
  deleteClosetItem,
  incrementWearCount,
} from '../services/storage';
import { filterItems, sortItems, getClosetStats } from '../utils/helpers';

export function useCloset() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    color: null,
    season: null,
    style: null,
    searchQuery: '',
  });
  const [sortBy, setSortBy] = useState('newest');

  // Load items from storage
  const loadItems = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const loaded = await loadClosetItems();
      setItems(loaded);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load closet items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Add a new item
  const addItem = useCallback(async (itemData, imageUri) => {
    try {
      const newItem = await saveClosetItem(itemData, imageUri);
      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      setError(err.message || 'Failed to add item');
      throw err;
    }
  }, []);

  // Update an existing item
  const updateItem = useCallback(async (itemId, updates, newImageUri) => {
    try {
      const updated = await updateClosetItem(itemId, updates, newImageUri);
      setItems(prev => prev.map(item => item.id === itemId ? updated : item));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update item');
      throw err;
    }
  }, []);

  // Delete an item
  const removeItem = useCallback(async (itemId) => {
    try {
      await deleteClosetItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err.message || 'Failed to delete item');
      throw err;
    }
  }, []);

  // Increment wear count
  const wearItem = useCallback(async (itemId) => {
    try {
      await incrementWearCount(itemId);
      setItems(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, wearCount: (item.wearCount || 0) + 1, lastWornAt: new Date().toISOString() }
          : item
      ));
    } catch (err) {
      console.error('Failed to increment wear count:', err);
    }
  }, []);

  // Refresh
  const refresh = useCallback(() => {
    loadItems(true);
  }, [loadItems]);

  // Get filtered + sorted items
  const filteredItems = sortItems(filterItems(items, filters), sortBy);

  // Get stats
  const stats = getClosetStats(items);

  // Update a filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      color: null,
      season: null,
      style: null,
      searchQuery: '',
    });
  }, []);

  // Get item by ID
  const getItem = useCallback((itemId) => {
    return items.find(item => item.id === itemId);
  }, [items]);

  return {
    items,
    filteredItems,
    loading,
    refreshing,
    error,
    filters,
    sortBy,
    stats,
    addItem,
    updateItem,
    removeItem,
    wearItem,
    refresh,
    updateFilter,
    resetFilters,
    setSortBy,
    getItem,
    reloadItems: loadItems,
  };
}

export default useCloset;
