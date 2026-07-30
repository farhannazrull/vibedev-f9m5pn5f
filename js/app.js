'use strict';

import { loadEpisodes, saveEpisodes } from './storage.js';
import { validateForm } from './validation.js';
import { renderQueue } from './render.js';

/* ── State ── */

let episodes = [];
let currentFilter = 'all';

/* ── DOM Refs ── */

const form = document.getElementById('add-form');
const showNameInput = document.getElementById('show-name');
const episodeTitleInput = document.getElementById('episode-title');
const notesInput = document.getElementById('episode-notes');
const showNameError = document.getElementById('show-name-error');
const episodeTitleError = document.getElementById('episode-title-error');
const notesError = document.getElementById('notes-error');
const queueList = document.getElementById('queue-list');
const emptyState = document.getElementById('empty-state');
const queueStatus = document.getElementById('queue-status');
const filterRadios = document.querySelectorAll('input[name="filter"]');

/* ── Pure Helpers ── */

/**
 * Generate a unique ID for a new episode.
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Clear all form error messages and error states.
 */
function clearErrors() {
  [showNameError, episodeTitleError, notesError].forEach(function (el) {
    el.hidden = true;
    el.textContent = '';
  });
  [showNameInput, episodeTitleInput, notesInput].forEach(function (el) {
    el.classList.remove('error');
  });
}

/**
 * Show a single field error.
 * @param {HTMLElement} inputEl
 * @param {HTMLElement} errorEl
 * @param {string} message
 */
function showFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('error');
  errorEl.textContent = message;
  errorEl.hidden = false;
}

/* ── Render ── */

function render() {
  renderQueue(episodes, currentFilter, queueList, emptyState, queueStatus);
}

/* ── Event Handlers ── */

/**
 * Handle form submission: validate and add episode.
 * @param {Event} event
 */
function handleSubmit(event) {
  event.preventDefault();
  clearErrors();

  const showName = showNameInput.value;
  const episodeTitle = episodeTitleInput.value;
  const notes = notesInput.value;

  const errors = validateForm(showName, episodeTitle, notes);
  const hasErrors = errors.showName || errors.episodeTitle || errors.notes;

  if (hasErrors) {
    if (errors.showName) showFieldError(showNameInput, showNameError, errors.showName);
    if (errors.episodeTitle) showFieldError(episodeTitleInput, episodeTitleError, errors.episodeTitle);
    if (errors.notes) showFieldError(notesInput, notesError, errors.notes);
    return;
  }

  const episode = {
    id: generateId(),
    showName: showName.trim(),
    episodeTitle: episodeTitle.trim(),
    notes: notes.trim(),
    listened: false,
    addedAt: new Date().toISOString(),
  };

  episodes.push(episode);
  saveEpisodes(episodes);
  render();
  form.reset();
  showNameInput.focus();
}

/**
 * Handle filter change.
 */
function handleFilterChange() {
  filterRadios.forEach(function (radio) {
    if (radio.checked) {
      currentFilter = radio.value;
    }
  });
  render();
}

/**
 * Handle clicks on queue action buttons (delegated).
 * @param {Event} event
 */
function handleQueueClick(event) {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;
  const index = episodes.findIndex(function (e) { return e.id === id; });
  if (index === -1) return;

  switch (action) {
    case 'toggle-listened': {
      episodes[index].listened = !episodes[index].listened;
      break;
    }
    case 'delete': {
      episodes.splice(index, 1);
      break;
    }
    case 'move-up': {
      if (index > 0) {
        const temp = episodes[index - 1];
        episodes[index - 1] = episodes[index];
        episodes[index] = temp;
      }
      break;
    }
    case 'move-down': {
      if (index < episodes.length - 1) {
        const temp = episodes[index + 1];
        episodes[index + 1] = episodes[index];
        episodes[index] = temp;
      }
      break;
    }
  }

  saveEpisodes(episodes);
  render();
}

/* ── Init ── */

function init() {
  if (document.fonts) {
    document.documentElement.classList.add('fonts-loading');
    document.fonts.ready.then(function () {
      document.documentElement.classList.remove('fonts-loading');
    });
  }

  episodes = loadEpisodes();

  form.addEventListener('submit', handleSubmit);

  filterRadios.forEach(function (radio) {
    radio.addEventListener('change', handleFilterChange);
  });

  queueList.addEventListener('click', handleQueueClick);

  render();

  if (episodes.length === 0) {
    showNameInput.focus();
  }
}

document.addEventListener('DOMContentLoaded', init);
