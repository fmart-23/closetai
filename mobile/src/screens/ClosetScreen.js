import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Colors from '../constants/colors';
import { clothingAPI } from '../services/api';
import { CATEGORIES } from '../constants/config';
import ClothingCard from '../components/ClothingCard';
import FilterChips from '../components/FilterChips';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const NUM_COLUMNS = 2;

export default function ClosetScreen() {
  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ---- Load items from API ----
  const loadItems = useCallback(async () => {
    try {
      setError(null);
      const data = await clothingAPI.getAll();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Re-fetch when screen comes back into focus (e.g., after item deletion)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadItems);
    return unsubscribe;
  }, [navigation, loadItems]);

  // ---- Filter logic ----
  useEffect(() => {
    let result = [...items];
    if (selectedCategory !== 'All') {
      result = result.filter(
        (i) => i.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.color?.toLowerCase().includes(q) ||
          i.style?.toLowerCase().includes(q) ||
          i.pattern?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [items, selectedCategory, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const handleItemPress = (item) => {
    navigation.navigate('ItemDetail', { item });
  };

  // ---- Render ----
  if (loading) {
    return <LoadingSpinner message="Loading your closet…" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Closet</Text>
        <Text style={styles.count}>{filtered.length} items</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, color, style…"
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter chips */}
      <FilterChips
        filters={CATEGORIES}
        selectedFilter={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={loadItems}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Items grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="👗"
            title={searchQuery ? 'No matches found' : 'Your closet is empty'}
            subtitle={
              searchQuery
                ? 'Try a different search or filter.'
                : 'Scan your first clothing item to get started!'
            }
            actionLabel={searchQuery ? undefined : 'Scan an Item'}
            onAction={
              searchQuery
                ? undefined
                : () => navigation.navigate('Scan')
            }
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ClothingCard item={item} onPress={() => handleItemPress(item)} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  count: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    paddingVertical: 12,
  },

  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.errorBg,
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  errorText: { color: Colors.error, fontSize: 13 },
  retryText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },

  grid: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardWrapper: {
    width: '48.5%',
  },
});
