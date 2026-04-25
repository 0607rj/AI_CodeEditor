// client/src/services/api.js
// Centralized API service layer using Axios
// WHY: Single file for all API calls. Easy to swap base URL for deployment.
// Custom error formatting gives consistent error messages to the UI.

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 120000, // 2 min timeout — AI calls can be slow
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Response interceptor for consistent error handling ──
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

/**
 * Intent Mode: Analyze code for issues and get optimized version
 */
export const analyzeCode = async (code, language = 'javascript', filename = 'code.js') => {
  return API.post('/analyze-code', { code, language, filename });
};

/**
 * Codebase Explainer: Parse and explain single file
 */
export const explainCode = async (code, filename = 'code.js') => {
  return API.post('/explain-codebase', { code, filename });
};

/**
 * Codebase Explainer: Parse and explain multiple files
 */
export const explainMultipleFiles = async (files) => {
  return API.post('/explain-codebase', { files });
};

/**
 * Memory: Store a new decision
 */
export const storeMemory = async (data) => {
  return API.post('/store-memory', data);
};

/**
 * Memory: Get all decisions with optional filters
 */
export const getMemories = async (params = {}) => {
  return API.get('/get-memory', { params });
};

/**
 * Memory: Delete a decision
 */
export const deleteMemory = async (id) => {
  return API.delete(`/delete-memory/${id}`);
};

/**
 * Health check
 */
export const healthCheck = async () => {
  return API.get('/health');
};

export default API;
