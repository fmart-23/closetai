import axios from 'axios';
import { API_URL } from '../constants/config';

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Response interceptor — normalize errors into a consistent shape
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ---------------------------------------------------------------------------
// Clothing API
// ---------------------------------------------------------------------------
export const clothingAPI = {
  /**
   * Fetch all clothing items, optionally filtered.
   * @param {{ category?: string, color?: string, style?: string, season?: string, search?: string }} filters
   */
  getAll: async (filters = {}) => {
    // Remove empty/undefined values so they don't become "undefined" query params
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v && v !== 'All')
    );
    const response = await api.get('/api/clothing', { params });
    return response.data;
  },

  /** Fetch a single clothing item by id. */
  getById: async (id) => {
    const response = await api.get(`/api/clothing/${id}`);
    return response.data;
  },

  /**
   * Upload a new clothing item with its image.
   * @param {FormData} formData — must include `image` file + metadata fields
   */
  create: async (formData) => {
    const response = await api.post('/api/clothing', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update metadata of an existing clothing item (no image re-upload).
   * @param {number|string} id
   * @param {object} data — fields to update
   */
  update: async (id, data) => {
    const response = await api.put(`/api/clothing/${id}`, data);
    return response.data;
  },

  /** Delete a clothing item and its associated image. */
  remove: async (id) => {
    const response = await api.delete(`/api/clothing/${id}`);
    return response.data;
  },
};

// ---------------------------------------------------------------------------
// Outfits API
// ---------------------------------------------------------------------------
export const outfitsAPI = {
  /**
   * Ask the AI for outfit recommendations based on user preferences.
   * @param {{ occasion: string, weather: string, style: string }} preferences
   */
  recommend: async (preferences) => {
    const response = await api.post('/api/outfits/recommend', preferences);
    return response.data;
  },

  /** Fetch all saved outfits. */
  getAll: async () => {
    const response = await api.get('/api/outfits');
    return response.data;
  },

  /**
   * Save an outfit to the database.
   * @param {{ name: string, occasion: string, style: string, description: string, items: number[] }} outfit
   */
  save: async (outfit) => {
    const response = await api.post('/api/outfits', outfit);
    return response.data;
  },

  /** Get a single outfit by id. */
  getById: async (id) => {
    const response = await api.get(`/api/outfits/${id}`);
    return response.data;
  },

  /** Delete a saved outfit. */
  remove: async (id) => {
    const response = await api.delete(`/api/outfits/${id}`);
    return response.data;
  },
};

export default api;
