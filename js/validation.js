'use strict';

/** @param {string} value @returns {string|null} */
function validateShowName(value) {
  const trimmed = (value || '').trim();
  if (trimmed.length === 0) return 'Show name is required.';
  if (trimmed.length > 100) return 'Show name must be 100 characters or fewer.';
  return null;
}

/** @param {string} value @returns {string|null} */
function validateEpisodeTitle(value) {
  const trimmed = (value || '').trim();
  if (trimmed.length === 0) return 'Episode title is required.';
  if (trimmed.length > 200) return 'Episode title must be 200 characters or fewer.';
  return null;
}

/** @param {string} value @returns {string|null} */
function validateNotes(value) {
  const trimmed = (value || '').trim();
  if (trimmed.length > 500) return 'Notes must be 500 characters or fewer.';
  return null;
}

/** @param {string} showName @param {string} episodeTitle @param {string} notes @returns {Object} */
function validateForm(showName, episodeTitle, notes) {
  return {
    showName: validateShowName(showName),
    episodeTitle: validateEpisodeTitle(episodeTitle),
    notes: validateNotes(notes),
  };
}

export { validateShowName, validateEpisodeTitle, validateNotes, validateForm };
