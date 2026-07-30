'use strict';

const STORAGE_KEY = 'podcast-queue';

/** @returns {Array} */
function loadEpisodes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data === null) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/** @param {Array} episodes */
function saveEpisodes(episodes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(episodes));
  } catch (e) {
    console.warn('Failed to save episodes to localStorage:', e);
  }
}

export { loadEpisodes, saveEpisodes };
