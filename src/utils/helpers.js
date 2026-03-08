/**
 * General utility functions for ClosetAI
 */
import { CLOTHING_TYPES, CLOTHING_CATEGORIES } from '../constants/categories';

/**
 * Generate a unique ID
 */
export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Format a date for display
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Format a date as a short string
 */
export function formatShortDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Get clothing type info by ID
 */
export function getClothingType(typeId) {
  return CLOTHING_TYPES.find(t => t.id === typeId) || { id: typeId, label: typeId, category: 'other', emoji: '👔' };
}

/**
 * Get clothing category info by ID
 */
export function getClothingCategory(categoryId) {
  return CLOTHING_CATEGORIES.find(c => c.id === categoryId) || { id: categoryId, label: categoryId, icon: '👔' };
}

/**
 * Get emoji for a clothing type
 */
export function getClothingEmoji(typeId) {
  const type = getClothingType(typeId);
  return type?.emoji || '👔';
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert snake_case to Title Case
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str.split('_').map(word => capitalize(word)).join(' ');
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Group an array of items by a key
 */
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const groupKey = item[key] || 'other';
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
    return groups;
  }, {});
}

/**
 * Filter closet items based on filter criteria
 */
export function filterItems(items, filters) {
  if (!items) return [];
  let filtered = [...items];

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(item => {
      const type = getClothingType(item.type);
      return type?.category === filters.category;
    });
  }

  if (filters.color) {
    filtered = filtered.filter(item => item.color === filters.color);
  }

  if (filters.season && filters.season !== 'all') {
    filtered = filtered.filter(item =>
      item.season === filters.season || item.season === 'all'
    );
  }

  if (filters.style) {
    filtered = filtered.filter(item => item.style === filters.style);
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      item.name?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item.color?.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query)
    );
  }

  return filtered;
}

/**
 * Sort closet items
 */
export function sortItems(items, sortBy = 'newest') {
  if (!items) return [];
  const sorted = [...items];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'name':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'type':
      return sorted.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    case 'color':
      return sorted.sort((a, b) => (a.color || '').localeCompare(b.color || ''));
    case 'most_worn':
      return sorted.sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0));
    default:
      return sorted;
  }
}

/**
 * Get statistics about a closet
 */
export function getClosetStats(items) {
  if (!items || items.length === 0) {
    return { total: 0, byCategory: {}, byColor: {}, byStyle: {} };
  }

  const byCategory = {};
  const byColor = {};
  const byStyle = {};

  items.forEach(item => {
    const type = getClothingType(item.type);
    const category = type?.category || 'other';

    byCategory[category] = (byCategory[category] || 0) + 1;

    if (item.color) {
      byColor[item.color] = (byColor[item.color] || 0) + 1;
    }

    if (item.style) {
      byStyle[item.style] = (byStyle[item.style] || 0) + 1;
    }
  });

  return {
    total: items.length,
    byCategory,
    byColor,
    byStyle,
    topCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    topColor: Object.entries(byColor).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
  };
}

/**
 * Debounce a function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Shuffle an array (Fisher-Yates)
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Pick N random items from an array
 */
export function pickRandom(array, n = 1) {
  const shuffled = shuffleArray(array);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

/**
 * Deep clone an object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default {
  generateId,
  formatDate,
  formatShortDate,
  getClothingType,
  getClothingCategory,
  getClothingEmoji,
  capitalize,
  toTitleCase,
  truncateText,
  groupBy,
  filterItems,
  sortItems,
  getClosetStats,
  debounce,
  shuffleArray,
  pickRandom,
  deepClone,
};
