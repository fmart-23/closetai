/**
 * Color theory algorithms for outfit matching
 * Implements color harmony rules for fashion recommendations
 */

// Color groups for compatibility matching
const COLOR_GROUPS = {
  neutral: ['white', 'black', 'gray', 'beige', 'cream', 'tan', 'camel', 'brown'],
  warm: ['red', 'orange', 'yellow', 'coral', 'mustard', 'burgundy', 'pink', 'hot_pink'],
  cool: ['blue', 'navy', 'light_blue', 'green', 'mint', 'teal', 'purple', 'lavender'],
  earth: ['brown', 'beige', 'tan', 'camel', 'cream', 'olive'],
};

// Complementary color pairs (opposite on color wheel)
const COMPLEMENTARY_PAIRS = {
  blue: ['orange', 'coral', 'mustard'],
  navy: ['orange', 'coral', 'mustard', 'camel', 'cream'],
  red: ['green', 'mint', 'teal'],
  burgundy: ['green', 'olive', 'mint'],
  purple: ['yellow', 'mustard', 'coral'],
  lavender: ['yellow', 'mustard', 'coral'],
  green: ['red', 'pink', 'coral', 'burgundy'],
  orange: ['blue', 'navy', 'teal'],
  yellow: ['purple', 'lavender', 'navy'],
  pink: ['green', 'mint', 'olive', 'navy'],
  teal: ['coral', 'orange', 'burgundy', 'pink'],
  coral: ['teal', 'navy', 'blue', 'green'],
  mustard: ['purple', 'navy', 'burgundy', 'blue'],
  olive: ['burgundy', 'pink', 'coral', 'camel'],
};

// Analogous color groups (adjacent on color wheel — always harmonious)
const ANALOGOUS_GROUPS = [
  ['red', 'orange', 'coral', 'hot_pink', 'pink'],
  ['orange', 'yellow', 'mustard', 'coral'],
  ['yellow', 'green', 'olive', 'mint'],
  ['green', 'teal', 'mint', 'olive'],
  ['teal', 'blue', 'light_blue'],
  ['blue', 'navy', 'purple', 'lavender'],
  ['purple', 'pink', 'lavender', 'burgundy'],
  ['pink', 'red', 'coral', 'hot_pink'],
];

// Monochromatic compatibility (same color family)
const MONO_GROUPS = {
  blue: ['blue', 'navy', 'light_blue', 'teal'],
  red: ['red', 'burgundy', 'coral', 'hot_pink'],
  green: ['green', 'olive', 'mint', 'teal'],
  pink: ['pink', 'hot_pink', 'lavender', 'coral'],
  purple: ['purple', 'lavender', 'burgundy'],
  neutral: ['white', 'cream', 'beige', 'tan', 'camel', 'gray', 'brown', 'black'],
  yellow: ['yellow', 'mustard', 'camel'],
};

/**
 * Returns a compatibility score between two colors (0-100)
 * Higher is better
 */
export function getColorCompatibilityScore(color1, color2) {
  if (!color1 || !color2) return 50;
  if (color1 === color2) return 90; // monochromatic
  if (color1 === 'multicolor' || color2 === 'multicolor') return 60;

  // Neutrals go with everything
  if (COLOR_GROUPS.neutral.includes(color1) || COLOR_GROUPS.neutral.includes(color2)) {
    return 85;
  }

  // Check complementary pairs
  const comp1 = COMPLEMENTARY_PAIRS[color1] || [];
  const comp2 = COMPLEMENTARY_PAIRS[color2] || [];
  if (comp1.includes(color2) || comp2.includes(color1)) {
    return 80;
  }

  // Check analogous groups
  for (const group of ANALOGOUS_GROUPS) {
    if (group.includes(color1) && group.includes(color2)) {
      return 75;
    }
  }

  // Check monochromatic groups
  for (const [, group] of Object.entries(MONO_GROUPS)) {
    if (group.includes(color1) && group.includes(color2)) {
      return 70;
    }
  }

  // Same temperature (both warm or both cool)
  const bothWarm = COLOR_GROUPS.warm.includes(color1) && COLOR_GROUPS.warm.includes(color2);
  const bothCool = COLOR_GROUPS.cool.includes(color1) && COLOR_GROUPS.cool.includes(color2);
  if (bothWarm || bothCool) {
    return 60;
  }

  // Clashing warm + cool
  return 35;
}

/**
 * Returns whether two colors pair well together
 */
export function doColorsMatch(color1, color2, threshold = 55) {
  return getColorCompatibilityScore(color1, color2) >= threshold;
}

/**
 * Get best color combinations for a given color
 */
export function getBestColorMatches(color) {
  const matches = [];

  // Always add neutrals
  COLOR_GROUPS.neutral.forEach(c => {
    if (c !== color) {
      matches.push({ color: c, score: 85 });
    }
  });

  // Add complementary colors
  const complementary = COMPLEMENTARY_PAIRS[color] || [];
  complementary.forEach(c => {
    if (!matches.find(m => m.color === c)) {
      matches.push({ color: c, score: 80 });
    }
  });

  // Add analogous colors
  for (const group of ANALOGOUS_GROUPS) {
    if (group.includes(color)) {
      group.forEach(c => {
        if (c !== color && !matches.find(m => m.color === c)) {
          matches.push({ color: c, score: 75 });
        }
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Get overall outfit color harmony score
 */
export function getOutfitColorScore(items) {
  if (!items || items.length < 2) return 70;

  const colors = items.map(item => item.color).filter(Boolean);
  if (colors.length < 2) return 70;

  let totalScore = 0;
  let comparisons = 0;

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      totalScore += getColorCompatibilityScore(colors[i], colors[j]);
      comparisons++;
    }
  }

  return comparisons > 0 ? Math.round(totalScore / comparisons) : 70;
}

/**
 * Returns whether a color is neutral
 */
export function isNeutralColor(color) {
  return COLOR_GROUPS.neutral.includes(color);
}

/**
 * Get color group for a color
 */
export function getColorGroup(color) {
  for (const [group, colors] of Object.entries(COLOR_GROUPS)) {
    if (colors.includes(color)) return group;
  }
  return 'other';
}

export default {
  getColorCompatibilityScore,
  doColorsMatch,
  getBestColorMatches,
  getOutfitColorScore,
  isNeutralColor,
  getColorGroup,
};
