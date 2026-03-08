/**
 * Shared utility helpers for ClosetAI
 */

/**
 * Format an ISO date string to a human-readable form.
 * e.g. "2024-03-08T12:00:00Z" → "Mar 8, 2024"
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Capitalize the first letter of every word.
 */
export function capitalize(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Map common color names to a representative hex value for display dots.
 */
export function getColorHex(colorName) {
  if (!colorName) return '#888888';
  const map = {
    black: '#1A1A1A',
    white: '#F5F5F5',
    grey: '#9E9E9E',
    gray: '#9E9E9E',
    red: '#E53935',
    pink: '#E91E8C',
    orange: '#FF6D00',
    yellow: '#FFD600',
    green: '#43A047',
    teal: '#00897B',
    blue: '#1E88E5',
    navy: '#1A237E',
    purple: '#7B1FA2',
    lavender: '#9575CD',
    brown: '#6D4C41',
    beige: '#D7CCC8',
    cream: '#FFF8E1',
    gold: '#FFB300',
    silver: '#BDBDBD',
    multicolor: 'linear', // caller should handle this
  };
  return map[colorName.toLowerCase()] || '#888888';
}

/**
 * Return an emoji icon representing a clothing category.
 */
export function getCategoryIcon(category) {
  if (!category) return '👕';
  const icons = {
    tops: '👕',
    bottoms: '👖',
    dresses: '👗',
    shoes: '👟',
    accessories: '👜',
    outerwear: '🧥',
    all: '🛍️',
  };
  return icons[category.toLowerCase()] || '👔';
}

/**
 * Truncate text to maxLength characters, appending "…" when trimmed.
 */
export function truncateText(text, maxLength = 40) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/**
 * Format bytes to a human-readable file size string.
 * e.g. 1048576 → "1.0 MB"
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = (bytes / Math.pow(1024, i)).toFixed(1);
  return `${value} ${units[i]}`;
}
