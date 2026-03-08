/**
 * Local storage service using AsyncStorage
 * Handles all data persistence for clothing items and outfits
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { APP_CONFIG } from '../constants/config';
import { generateId } from '../utils/helpers';

const { storageKeys, imageDirectory } = APP_CONFIG;

// ─── Image Storage ────────────────────────────────────────────────────────────

/**
 * Get the path to the app's image directory
 */
export function getImageDirectory() {
  return `${FileSystem.documentDirectory}${imageDirectory}/`;
}

/**
 * Ensure the image directory exists
 */
async function ensureImageDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(getImageDirectory());
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(getImageDirectory(), { intermediates: true });
  }
}

/**
 * Save an image to local storage and return the local path
 */
export async function saveImage(sourceUri) {
  await ensureImageDirectory();
  const filename = `${generateId()}.jpg`;
  const destPath = `${getImageDirectory()}${filename}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destPath,
  });

  return destPath;
}

/**
 * Delete an image from local storage
 */
export async function deleteImage(imagePath) {
  if (!imagePath) return;
  try {
    const info = await FileSystem.getInfoAsync(imagePath);
    if (info.exists) {
      await FileSystem.deleteAsync(imagePath);
    }
  } catch (error) {
    console.warn('Error deleting image:', error);
  }
}

// ─── Closet Items ─────────────────────────────────────────────────────────────

/**
 * Load all closet items from storage
 */
export async function loadClosetItems() {
  try {
    const json = await AsyncStorage.getItem(storageKeys.closetItems);
    if (!json) return [];
    const items = JSON.parse(json);
    // Verify images still exist
    const verified = await Promise.all(
      items.map(async (item) => {
        if (item.imageUri) {
          const info = await FileSystem.getInfoAsync(item.imageUri);
          if (!info.exists) {
            return { ...item, imageUri: null };
          }
        }
        return item;
      })
    );
    return verified;
  } catch (error) {
    console.error('Error loading closet items:', error);
    return [];
  }
}

/**
 * Save a new clothing item
 */
export async function saveClosetItem(item, imageUri) {
  try {
    const items = await loadClosetItems();
    let savedImageUri = null;

    if (imageUri) {
      savedImageUri = await saveImage(imageUri);
    }

    const newItem = {
      id: generateId(),
      ...item,
      imageUri: savedImageUri,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wearCount: 0,
    };

    const updatedItems = [newItem, ...items];
    await AsyncStorage.setItem(storageKeys.closetItems, JSON.stringify(updatedItems));
    return newItem;
  } catch (error) {
    console.error('Error saving closet item:', error);
    throw error;
  }
}

/**
 * Update an existing clothing item
 */
export async function updateClosetItem(itemId, updates, newImageUri) {
  try {
    const items = await loadClosetItems();
    const index = items.findIndex(item => item.id === itemId);
    if (index === -1) throw new Error('Item not found');

    const existingItem = items[index];
    let imageUri = existingItem.imageUri;

    if (newImageUri && newImageUri !== existingItem.imageUri) {
      // Delete old image and save new one
      await deleteImage(existingItem.imageUri);
      imageUri = await saveImage(newImageUri);
    }

    items[index] = {
      ...existingItem,
      ...updates,
      imageUri,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(storageKeys.closetItems, JSON.stringify(items));
    return items[index];
  } catch (error) {
    console.error('Error updating closet item:', error);
    throw error;
  }
}

/**
 * Delete a clothing item
 */
export async function deleteClosetItem(itemId) {
  try {
    const items = await loadClosetItems();
    const item = items.find(i => i.id === itemId);

    if (item?.imageUri) {
      await deleteImage(item.imageUri);
    }

    const updatedItems = items.filter(i => i.id !== itemId);
    await AsyncStorage.setItem(storageKeys.closetItems, JSON.stringify(updatedItems));
    return true;
  } catch (error) {
    console.error('Error deleting closet item:', error);
    throw error;
  }
}

/**
 * Increment wear count for an item
 */
export async function incrementWearCount(itemId) {
  try {
    const items = await loadClosetItems();
    const index = items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      items[index].wearCount = (items[index].wearCount || 0) + 1;
      items[index].lastWornAt = new Date().toISOString();
      await AsyncStorage.setItem(storageKeys.closetItems, JSON.stringify(items));
    }
  } catch (error) {
    console.error('Error incrementing wear count:', error);
  }
}

// ─── Saved Outfits ────────────────────────────────────────────────────────────

/**
 * Load all saved outfits
 */
export async function loadSavedOutfits() {
  try {
    const json = await AsyncStorage.getItem(storageKeys.savedOutfits);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error loading saved outfits:', error);
    return [];
  }
}

/**
 * Save an outfit
 */
export async function saveOutfit(outfit) {
  try {
    const outfits = await loadSavedOutfits();
    const newOutfit = {
      id: generateId(),
      ...outfit,
      savedAt: new Date().toISOString(),
    };
    const updatedOutfits = [newOutfit, ...outfits];
    await AsyncStorage.setItem(storageKeys.savedOutfits, JSON.stringify(updatedOutfits));
    return newOutfit;
  } catch (error) {
    console.error('Error saving outfit:', error);
    throw error;
  }
}

/**
 * Delete a saved outfit
 */
export async function deleteSavedOutfit(outfitId) {
  try {
    const outfits = await loadSavedOutfits();
    const updatedOutfits = outfits.filter(o => o.id !== outfitId);
    await AsyncStorage.setItem(storageKeys.savedOutfits, JSON.stringify(updatedOutfits));
    return true;
  } catch (error) {
    console.error('Error deleting outfit:', error);
    throw error;
  }
}

/**
 * Toggle outfit favorite status
 */
export async function toggleOutfitFavorite(outfitId) {
  try {
    const outfits = await loadSavedOutfits();
    const index = outfits.findIndex(o => o.id === outfitId);
    if (index !== -1) {
      outfits[index].isFavorite = !outfits[index].isFavorite;
      await AsyncStorage.setItem(storageKeys.savedOutfits, JSON.stringify(outfits));
      return outfits[index];
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}

// ─── User Preferences ─────────────────────────────────────────────────────────

/**
 * Load user preferences
 */
export async function loadPreferences() {
  try {
    const json = await AsyncStorage.getItem(storageKeys.userPreferences);
    return json ? JSON.parse(json) : getDefaultPreferences();
  } catch (error) {
    return getDefaultPreferences();
  }
}

/**
 * Save user preferences
 */
export async function savePreferences(prefs) {
  try {
    await AsyncStorage.setItem(storageKeys.userPreferences, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

function getDefaultPreferences() {
  return {
    darkMode: false,
    defaultOccasion: 'casual',
    defaultSeason: 'all',
    favoriteStyles: [],
    notifications: true,
  };
}

// ─── Clear All Data ───────────────────────────────────────────────────────────

/**
 * Clear all app data (for debugging/reset)
 */
export async function clearAllData() {
  try {
    await AsyncStorage.multiRemove([
      storageKeys.closetItems,
      storageKeys.savedOutfits,
      storageKeys.userPreferences,
      storageKeys.onboardingComplete,
    ]);
    // Clear image directory
    const dirInfo = await FileSystem.getInfoAsync(getImageDirectory());
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(getImageDirectory(), { idempotent: true });
    }
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

export default {
  loadClosetItems,
  saveClosetItem,
  updateClosetItem,
  deleteClosetItem,
  incrementWearCount,
  loadSavedOutfits,
  saveOutfit,
  deleteSavedOutfit,
  toggleOutfitFavorite,
  loadPreferences,
  savePreferences,
  saveImage,
  deleteImage,
  getImageDirectory,
  clearAllData,
};
