/**
 * App color palette — fashion-forward, warm neutrals with blush pink accents
 */
export const COLORS = {
  // Primary palette
  primary: '#C9956C',        // Warm terracotta
  primaryLight: '#E8BFA0',   // Light terracotta
  primaryDark: '#A0714F',    // Deep terracotta
  accent: '#D4A5A5',         // Blush pink
  accentLight: '#F0D4D4',    // Light blush
  accentDark: '#B8857F',     // Deep blush

  // Neutrals
  background: '#FAF7F4',     // Warm off-white
  surface: '#FFFFFF',        // Pure white
  surfaceAlt: '#F5F0EB',     // Warm cream
  card: '#FFFFFF',

  // Text
  textPrimary: '#2C2018',    // Deep warm brown
  textSecondary: '#6B5B4E',  // Medium warm brown
  textTertiary: '#A89990',   // Light warm brown
  textOnPrimary: '#FFFFFF',  // White text on primary

  // Borders & Dividers
  border: '#E8E0D8',
  borderLight: '#F2EDE8',
  divider: '#EDE7E0',

  // Status colors
  success: '#7BAF86',        // Sage green
  successLight: '#C8E6CC',
  warning: '#E8B86D',        // Warm amber
  warningLight: '#FAE5BC',
  error: '#C97070',          // Soft red
  errorLight: '#F2CECE',
  info: '#7BA7C9',           // Muted blue

  // Dark mode
  darkBackground: '#1A1410',
  darkSurface: '#2C2018',
  darkCard: '#3A2E26',
  darkBorder: '#4A3C32',
  darkText: '#F5EDE5',
  darkTextSecondary: '#C0A898',

  // Category colors
  categories: {
    tops: '#D4A5A5',
    bottoms: '#A5B8D4',
    outerwear: '#A5D4B8',
    dresses: '#D4A5C8',
    shoes: '#C8D4A5',
    accessories: '#D4C8A5',
    activewear: '#A5C8D4',
    formalwear: '#C8A5D4',
  },

  // Transparent variants
  primaryTransparent: 'rgba(201, 149, 108, 0.15)',
  accentTransparent: 'rgba(212, 165, 165, 0.15)',
  blackTransparent: 'rgba(0, 0, 0, 0.5)',
  whiteTransparent: 'rgba(255, 255, 255, 0.9)',
};

export const DARK_COLORS = {
  ...COLORS,
  background: COLORS.darkBackground,
  surface: COLORS.darkSurface,
  surfaceAlt: '#241C14',
  card: COLORS.darkCard,
  textPrimary: COLORS.darkText,
  textSecondary: COLORS.darkTextSecondary,
  textTertiary: '#8A7060',
  border: COLORS.darkBorder,
  borderLight: '#3A2E26',
  divider: '#3A2E26',
};

export const GRADIENTS = {
  primary: ['#C9956C', '#D4A5A5'],
  warm: ['#FAF7F4', '#F5EDE5'],
  card: ['#FFFFFF', '#FAF7F4'],
  hero: ['#2C2018', '#6B5B4E'],
  sunset: ['#E8BFA0', '#D4A5A5', '#C9956C'],
};

export default COLORS;
