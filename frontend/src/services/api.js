// API service layer for ClosetAI
// All requests go through this module for consistent error handling

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// ── Clothing ──────────────────────────────────────────────────────────────────

/**
 * Upload and classify a new clothing item.
 * @param {File} imageFile
 * @param {Object} metadata - { name, brand, notes }
 */
export async function uploadClothing(imageFile, metadata = {}) {
  const formData = new FormData();
  formData.append("image", imageFile);
  if (metadata.name) formData.append("name", metadata.name);
  if (metadata.brand) formData.append("brand", metadata.brand);
  if (metadata.notes) formData.append("notes", metadata.notes);

  const res = await api.post("/api/clothing", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * List all clothing items, with optional filters.
 * @param {Object} filters - { clothing_type, color, style, season, search }
 */
export async function getClothing(filters = {}) {
  const res = await api.get("/api/clothing", { params: filters });
  return res.data;
}

/**
 * Get a single clothing item by ID.
 */
export async function getClothingItem(id) {
  const res = await api.get(`/api/clothing/${id}`);
  return res.data;
}

/**
 * Update a clothing item.
 * @param {number} id
 * @param {Object} data - fields to update
 */
export async function updateClothingItem(id, data) {
  const res = await api.put(`/api/clothing/${id}`, data);
  return res.data;
}

/**
 * Delete a clothing item.
 * @param {number} id
 */
export async function deleteClothingItem(id) {
  await api.delete(`/api/clothing/${id}`);
}

// ── Outfits ───────────────────────────────────────────────────────────────────

/**
 * Get an AI-generated outfit recommendation.
 * @param {Object} params - { occasion, weather, style_preference }
 */
export async function recommendOutfit(params) {
  const res = await api.post("/api/outfits/recommend", params);
  return res.data;
}

/**
 * List all saved outfits.
 */
export async function getOutfits() {
  const res = await api.get("/api/outfits");
  return res.data;
}

/**
 * Save an outfit.
 * @param {Object} outfit - { name, occasion, weather, style_preference, item_ids, description, styling_tips }
 */
export async function saveOutfit(outfit) {
  const res = await api.post("/api/outfits", outfit);
  return res.data;
}

/**
 * Delete a saved outfit.
 * @param {number} id
 */
export async function deleteOutfit(id) {
  await api.delete(`/api/outfits/${id}`);
}

/**
 * Get image URL from image_path returned by API.
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}${imagePath}`;
}

export default api;
