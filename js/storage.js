'use strict';

const STORAGE_KEY = 'podcast-queue';

/**
 * Load episodes from localStorage.
 * @returns {Array} Array of episode objects, or empty array on failure.
 */
function loadEpisodes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data === null) {
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Save episodes to localStorage.
 * @param {Array} episodes
 */
function saveEpisodes(episodes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(episodes));
  } catch {
    /* localStorage full or unavailable — silently ignore */
  }
}

export { loadEpisodes, saveEpisodes };
