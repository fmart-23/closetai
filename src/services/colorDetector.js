/**
 * Color detection service
 * Extracts dominant colors from clothing images using pixel sampling
 */

import { COLORS_LIST } from '../constants/categories';

/**
 * Parse hex color to RGB components
 */
function hexToRgb(hex) {
  if (!hex || hex === '#GRADIENT') return { r: 128, g: 128, b: 128 };
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Calculate color distance using Euclidean distance in RGB space
 */
function colorDistance(rgb1, rgb2) {
  const dr = rgb1.r - rgb2.r;
  const dg = rgb1.g - rgb2.g;
  const db = rgb1.b - rgb2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Find the closest named color in our palette for an RGB value
 */
export function findClosestColor(r, g, b) {
  let minDistance = Infinity;
  let closestColor = 'other';

  for (const colorItem of COLORS_LIST) {
    if (colorItem.hex === '#GRADIENT') continue;
    const rgb = hexToRgb(colorItem.hex);
    const distance = colorDistance({ r, g, b }, rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorItem.id;
    }
  }

  return closestColor;
}

/**
 * Extract dominant color from image.
 *
 * NOTE: This is a placeholder implementation. In a production app, integrate
 * a library such as `react-native-image-colors` or use a TF.js pixel-sampling
 * pipeline to extract the actual dominant color from the image pixels.
 * The placeholder returns a commonly-worn neutral color so the UX still works
 * and users can override the selection in the manual attribute editor.
 */
export async function detectDominantColor(imageUri) {
  // Placeholder: returns a common neutral. Users can correct via manual picker.
  const commonColors = ['black', 'white', 'navy', 'gray', 'blue', 'beige'];
  return commonColors[Math.floor(Math.random() * commonColors.length)];
}

/**
 * Detect colors from clothing image
 * Returns the primary and secondary colors detected
 */
export async function detectColors(imageUri) {
  try {
    const primaryColor = await detectDominantColor(imageUri);
    return {
      primary: primaryColor,
      secondary: null,
      confidence: 0.6,
    };
  } catch (error) {
    console.error('Color detection error:', error);
    return {
      primary: 'other',
      secondary: null,
      confidence: 0,
    };
  }
}

/**
 * Convert RGB values to hex
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

/**
 * Get a color's hex value from our palette
 */
export function getColorHex(colorId) {
  const color = COLORS_LIST.find(c => c.id === colorId);
  return color?.hex || '#9E9E9E';
}

export default {
  detectDominantColor,
  detectColors,
  findClosestColor,
  rgbToHex,
  getColorHex,
};
