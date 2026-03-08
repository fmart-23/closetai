// App-wide configuration constants
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const APP_NAME = 'ClosetAI';
export const APP_VERSION = '1.0.0';

// Pagination
export const PAGE_SIZE = 20;
export const RECENT_ITEMS_LIMIT = 5;

// Image upload
export const MAX_IMAGE_SIZE_MB = 10;
export const IMAGE_QUALITY = 0.8; // 0–1 for expo-image-picker

// Categories used for filtering and display
export const CATEGORIES = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
];

// Season options
export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];

// Style tags
export const STYLES = ['Classic', 'Trendy', 'Minimalist', 'Bold', 'Sporty', 'Casual', 'Formal'];

// Pattern options
export const PATTERNS = ['Solid', 'Striped', 'Plaid', 'Floral', 'Abstract', 'Animal Print', 'Checkered'];

export default {
  API_URL,
  APP_NAME,
  APP_VERSION,
  PAGE_SIZE,
  RECENT_ITEMS_LIMIT,
  MAX_IMAGE_SIZE_MB,
  IMAGE_QUALITY,
  CATEGORIES,
  SEASONS,
  STYLES,
  PATTERNS,
};
