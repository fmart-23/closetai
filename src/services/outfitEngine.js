/**
 * Rule-based outfit recommendation engine
 * Uses color theory, style compatibility, season, and occasion rules
 * Completely offline — no API needed
 */

import { getColorCompatibilityScore, getOutfitColorScore } from '../utils/colorTheory';
import { CLOTHING_TYPES, OCCASIONS } from '../constants/categories';
import { shuffleArray, pickRandom } from '../utils/helpers';

// ─── Style Compatibility Matrix ───────────────────────────────────────────────

const STYLE_COMPATIBILITY = {
  casual: ['casual', 'sporty', 'streetwear', 'bohemian', 'minimalist'],
  formal: ['formal', 'business', 'classic', 'minimalist'],
  business: ['business', 'formal', 'classic', 'minimalist', 'preppy'],
  sporty: ['sporty', 'casual', 'streetwear'],
  streetwear: ['streetwear', 'casual', 'sporty', 'edgy'],
  bohemian: ['bohemian', 'casual', 'romantic', 'vintage'],
  minimalist: ['minimalist', 'casual', 'formal', 'business', 'classic'],
  preppy: ['preppy', 'classic', 'business', 'romantic'],
  vintage: ['vintage', 'romantic', 'bohemian', 'classic'],
  romantic: ['romantic', 'bohemian', 'vintage', 'preppy'],
  edgy: ['edgy', 'streetwear', 'sporty'],
  classic: ['classic', 'formal', 'business', 'preppy', 'minimalist'],
};

// ─── Occasion Compatibility ────────────────────────────────────────────────────

const OCCASION_STYLE_MAP = {
  casual: ['casual', 'sporty', 'streetwear', 'bohemian', 'minimalist'],
  work: ['business', 'formal', 'classic', 'minimalist', 'preppy'],
  date: ['romantic', 'casual', 'classic', 'bohemian', 'minimalist'],
  formal: ['formal', 'classic', 'minimalist'],
  gym: ['sporty'],
  outdoor: ['casual', 'sporty', 'bohemian'],
  beach: ['casual', 'sporty', 'bohemian'],
  party: ['streetwear', 'edgy', 'romantic', 'classic', 'formal'],
  travel: ['casual', 'sporty', 'minimalist'],
  brunch: ['casual', 'romantic', 'bohemian', 'preppy'],
};

// ─── Season / Weather Compatibility ───────────────────────────────────────────

const WEATHER_SEASON_MAP = {
  hot: ['summer'],
  warm: ['spring', 'summer', 'all'],
  mild: ['spring', 'fall', 'all'],
  cool: ['fall', 'all'],
  cold: ['fall', 'winter', 'all'],
  freezing: ['winter'],
  rainy: ['spring', 'fall', 'winter', 'all'],
  snowy: ['winter'],
};

// ─── Category Requirements for Outfits ────────────────────────────────────────

const OUTFIT_SLOTS = {
  full: {
    required: ['tops', 'bottoms'],
    optional: ['outerwear', 'shoes', 'accessories'],
    alternatives: [['dresses']], // dresses can replace tops+bottoms
  },
  dress_only: {
    required: ['dresses'],
    optional: ['outerwear', 'shoes', 'accessories'],
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getItemCategory(item) {
  const type = CLOTHING_TYPES.find(t => t.id === item.type);
  return type?.category || 'other';
}

function isSeasonCompatible(item, weather) {
  const seasonItem = item.season || 'all';
  if (seasonItem === 'all') return true;

  const validSeasons = WEATHER_SEASON_MAP[weather] || ['all'];
  return validSeasons.includes(seasonItem);
}

function isStyleCompatible(style1, style2) {
  if (!style1 || !style2) return true;
  const compatible = STYLE_COMPATIBILITY[style1] || [];
  return compatible.includes(style2);
}

function isOccasionCompatible(item, occasion) {
  const itemStyle = item.style;
  if (!itemStyle || !occasion) return true;
  const compatibleStyles = OCCASION_STYLE_MAP[occasion] || [];
  return compatibleStyles.includes(itemStyle);
}

/**
 * Score an outfit combination (0–100)
 */
function scoreOutfit(items) {
  if (!items || items.length === 0) return 0;

  let score = 60; // Base score

  // Color harmony bonus (up to 25 points)
  const colorScore = getOutfitColorScore(items);
  score += Math.round((colorScore - 50) * 0.5);

  // Style consistency bonus (up to 15 points)
  const styles = items.map(i => i.style).filter(Boolean);
  if (styles.length >= 2) {
    let styleCompatCount = 0;
    let styleCompat = 0;
    for (let i = 0; i < styles.length; i++) {
      for (let j = i + 1; j < styles.length; j++) {
        styleCompatCount++;
        if (isStyleCompatible(styles[i], styles[j])) styleCompat++;
      }
    }
    if (styleCompatCount > 0) {
      score += Math.round(15 * (styleCompat / styleCompatCount));
    }
  }

  // Completeness bonus: having shoes (up to 5 points)
  const categories = items.map(getItemCategory);
  if (categories.includes('shoes')) score += 5;
  if (categories.includes('accessories')) score += 3;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate outfit combinations from closet items
 */
export function generateOutfits(closetItems, options = {}) {
  const {
    occasion = 'casual',
    weather = 'mild',
    stylePreference = null,
    maxOutfits = 5,
  } = options;

  if (!closetItems || closetItems.length === 0) {
    return [];
  }

  // Step 1: Filter items by season and occasion
  const filteredItems = closetItems.filter(item => {
    if (!isSeasonCompatible(item, weather)) return false;
    if (!isOccasionCompatible(item, occasion)) return false;
    return true;
  });

  // Fall back to all items if too few after filtering
  const itemPool = filteredItems.length >= 3 ? filteredItems : closetItems;

  // Step 2: Group items by category
  const itemsByCategory = {};
  itemPool.forEach(item => {
    const cat = getItemCategory(item);
    if (!itemsByCategory[cat]) itemsByCategory[cat] = [];
    itemsByCategory[cat].push(item);
  });

  const tops = itemsByCategory['tops'] || [];
  const bottoms = itemsByCategory['bottoms'] || [];
  const dresses = itemsByCategory['dresses'] || [];
  const outerwear = itemsByCategory['outerwear'] || [];
  const shoes = itemsByCategory['shoes'] || [];
  const accessories = itemsByCategory['accessories'] || [];

  const outfitCombinations = [];

  // Step 3: Generate outfits with tops + bottoms
  const shuffledTops = shuffleArray(tops);
  const shuffledBottoms = shuffleArray(bottoms);
  const shuffledDresses = shuffleArray(dresses);

  // Tops + Bottoms combinations
  for (const top of shuffledTops.slice(0, 6)) {
    for (const bottom of shuffledBottoms.slice(0, 6)) {
      if (outfitCombinations.length >= maxOutfits * 3) break;

      const outfitItems = [top, bottom];

      // Try to add style-compatible outerwear
      if (outerwear.length > 0) {
        const compatibleOuter = outerwear.find(ow =>
          isStyleCompatible(top.style, ow.style) &&
          getColorCompatibilityScore(top.color, ow.color) >= 55
        );
        if (compatibleOuter) outfitItems.push(compatibleOuter);
      }

      // Try to add matching shoes
      if (shoes.length > 0) {
        const sortedShoes = shoes.sort((a, b) =>
          getColorCompatibilityScore(bottom.color, b.color) -
          getColorCompatibilityScore(bottom.color, a.color)
        );
        outfitItems.push(sortedShoes[0]);
      }

      // Optional accessories
      if (accessories.length > 0 && Math.random() > 0.5) {
        outfitItems.push(pickRandom(accessories));
      }

      const score = scoreOutfit(outfitItems);
      outfitCombinations.push({ items: outfitItems, score });
    }
  }

  // Dress-only combinations
  for (const dress of shuffledDresses.slice(0, 4)) {
    if (outfitCombinations.length >= maxOutfits * 3) break;

    const outfitItems = [dress];

    // Try to add outerwear
    if (outerwear.length > 0) {
      const compatibleOuter = outerwear.find(ow =>
        getColorCompatibilityScore(dress.color, ow.color) >= 55
      );
      if (compatibleOuter) outfitItems.push(compatibleOuter);
    }

    // Try to add shoes
    if (shoes.length > 0) {
      const sortedShoes = shoes.sort((a, b) =>
        getColorCompatibilityScore(dress.color, b.color) -
        getColorCompatibilityScore(dress.color, a.color)
      );
      outfitItems.push(sortedShoes[0]);
    }

    // Optional accessories
    if (accessories.length > 0) {
      outfitItems.push(pickRandom(accessories));
    }

    const score = scoreOutfit(outfitItems);
    outfitCombinations.push({ items: outfitItems, score });
  }

  // Step 4: Sort by score and return top N
  outfitCombinations.sort((a, b) => b.score - a.score);
  return outfitCombinations.slice(0, maxOutfits).map((outfit, index) => ({
    id: `outfit_${Date.now()}_${index}`,
    items: outfit.items,
    score: outfit.score,
    occasion,
    weather,
    generatedAt: new Date().toISOString(),
  }));
}

/**
 * Get a single random outfit combination
 */
export function getRandomOutfit(closetItems, options = {}) {
  const outfits = generateOutfits(closetItems, {
    ...options,
    maxOutfits: 10,
  });

  if (outfits.length === 0) return null;
  return outfits[Math.floor(Math.random() * Math.min(3, outfits.length))];
}

/**
 * Find similar items in the closet
 */
export function findSimilarItems(item, closetItems, limit = 4) {
  if (!item || !closetItems) return [];

  const itemCategory = getItemCategory(item);

  return closetItems
    .filter(i => i.id !== item.id)
    .map(i => ({
      item: i,
      score: calculateSimilarityScore(item, i, itemCategory),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.item);
}

function calculateSimilarityScore(item1, item2, category1) {
  let score = 0;
  const category2 = getItemCategory(item2);

  // Same category: high similarity
  if (category1 === category2) score += 40;
  else if (item1.type === item2.type) score += 30;

  // Color similarity
  const colorScore = getColorCompatibilityScore(item1.color, item2.color);
  score += Math.round(colorScore * 0.3);

  // Style similarity
  if (item1.style && item1.style === item2.style) score += 20;

  // Season similarity
  if (item1.season === item2.season || item1.season === 'all' || item2.season === 'all') {
    score += 10;
  }

  return score;
}

/**
 * Get a daily outfit suggestion (reproducible based on date)
 */
export function getDailyOutfit(closetItems) {
  if (!closetItems || closetItems.length === 0) return null;

  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );

  // Use day of year as seed for reproducible daily outfit
  const outfits = generateOutfits(closetItems, {
    occasion: 'casual',
    weather: 'mild',
    maxOutfits: 10,
  });

  if (outfits.length === 0) return null;
  return outfits[dayOfYear % outfits.length];
}

export default {
  generateOutfits,
  getRandomOutfit,
  findSimilarItems,
  getDailyOutfit,
  scoreOutfit,
};
