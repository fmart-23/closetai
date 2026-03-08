/**
 * App-wide configuration constants
 */

export const APP_CONFIG = {
  name: 'ClosetAI',
  version: '1.0.0',
  storageKeys: {
    closetItems: '@closetai_items',
    outfits: '@closetai_outfits',
    savedOutfits: '@closetai_saved_outfits',
    userPreferences: '@closetai_preferences',
    onboardingComplete: '@closetai_onboarding',
  },
  imageDirectory: 'closetai_images',
  maxImageSize: 1024,  // pixels
  imageQuality: 0.8,
  gridColumns: 2,
  maxRecentItems: 6,
  maxOutfitSuggestions: 5,
};

export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  spring: {
    damping: 15,
    stiffness: 200,
    mass: 1,
  },
};

export const TYPOGRAPHY = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#2C2018',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#2C2018',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2C2018',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
};

export default APP_CONFIG;
