'use strict';

import { loadEpisodes, saveEpisodes } from './storage.js';
import { validateForm } from './validation.js';
import { renderQueue } from './render.js';

/* ─── State ─── */

var episodes = [];
var currentFilter = 'all';
var editingId = null;
var searchTerm = '';

/* ── DOM Refs ── */

var form = document.getElementById('add-form');
var showNameInput = document.getElementById('show-name');
var episodeTitleInput = document.getElementById('episode-title');
var notesInput = document.getElementById('episode-notes');
var showNameError = document.getElementById('show-name-error');
var episodeTitleError = document.getElementById('episode-title-error');
var notesError = document.getElementById('notes-error');
var notesCounter = document.getElementById('notes-counter');
var submitBtn = document.getElementById('submit-btn');
var cancelBtn = document.getElementById('cancel-btn');
var queueList = document.getElementById('queue-list');
var emptyState = document.getElementById('empty-state');
var queueStatus = document.getElementById('queue-status');
var filterRadios = document.querySelectorAll('input[name="filter"]');
var searchInput = document.getElementById('search-input');
var addHeading = document.getElementById('add-heading');

/* ── Helpers ── */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function updateCharCounter() {
  var len = notesInput.value.length;
  notesCounter.textContent = len + '/500';
  if (len > 450) {
    notesCounter.classList.add('near-limit');
  } else {
    notesCounter.classList.remove('near-limit');
  }
}

function startEditing(id) {
  var ep = episodes.find(function (e) { return e.id === id; });
  if (!ep) return;
  editingId = id;
  showNameInput.value = ep.showName;
  episodeTitleInput.value = ep.episodeTitle;
  notesInput.value = ep.notes || '';
  submitBtn.textContent = 'Update Episode';
  cancelBtn.hidden = false;
  addHeading.dataset.editing = 'true';
  updateCharCounter();
  clearErrors();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showNameInput.focus();
}

function cancelEditing() {
  editingId = null;
  form.reset();
  submitBtn.textContent = 'Add to Queue';
  cancelBtn.hidden = true;
  addHeading.dataset.editing = 'false';
  updateCharCounter();
  clearErrors();
}

function clearErrors() {
  [showNameError, episodeTitleError, notesError].forEach(function (el) {
    el.hidden = true;
    el.textContent = '';
  });
  [showNameInput, episodeTitleInput, notesInput].forEach(function (el) {
    el.classList.remove('error');
  });
}

function showFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('error');
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function render() {
  var oldMap = {};
  var cards = queueList.querySelectorAll('.episode-card');
  cards.forEach(function (card) {
    oldMap[card.dataset.id] = card.getBoundingClientRect().top;
  });

  renderQueue(episodes, currentFilter, searchTerm, queueList, emptyState, queueStatus);

  var newCards = queueList.querySelectorAll('.episode-card');
  newCards.forEach(function (card) {
    var oldTop = oldMap[card.dataset.id];
    if (oldTop !== undefined) {
      var newTop = card.getBoundingClientRect().top;
      var diff = oldTop - newTop;
      if (diff !== 0) {
        card.style.transform = 'translateY(' + diff + 'px)';
        card.style.transition = 'none';
        requestAnimationFrame(function () {
          card.style.transition = 'transform 0.25s ease';
          card.style.transform = '';
        });
        card.addEventListener('transitionend', function cleanup() {
          card.style.transition = '';
          card.removeEventListener('transitionend', cleanup);
        });
      }
    } else {
      card.style.opacity = '0';
      requestAnimationFrame(function () {
        card.style.transition = 'opacity 0.2s ease';
        card.style.opacity = '1';
      });
      card.addEventListener('transitionend', function cleanup() {
        card.style.transition = '';
        card.style.opacity = '';
        card.removeEventListener('transitionend', cleanup);
      });
    }
  });
}

/* ── Event Handlers ── */

/** @param {Event} event */
function handleSubmit(event) {
  event.preventDefault();
  clearErrors();

  var showName = showNameInput.value;
  var episodeTitle = episodeTitleInput.value;
  var notes = notesInput.value;

  var errors = validateForm(showName, episodeTitle, notes);
  var hasErrors = errors.showName || errors.episodeTitle || errors.notes;

  if (hasErrors) {
    if (errors.showName) showFieldError(showNameInput, showNameError, errors.showName);
    if (errors.episodeTitle) showFieldError(episodeTitleInput, episodeTitleError, errors.episodeTitle);
    if (errors.notes) showFieldError(notesInput, notesError, errors.notes);
    return;
  }

  if (editingId) {
    var target = episodes.find(function (e) { return e.id === editingId; });
    if (target) {
      target.showName = showName.trim();
      target.episodeTitle = episodeTitle.trim();
      target.notes = notes.trim();
    }
    cancelEditing();
  } else {
    episodes.push({
      id: generateId(),
      showName: showName.trim(),
      episodeTitle: episodeTitle.trim(),
      notes: notes.trim(),
      listened: false,
      addedAt: new Date().toISOString(),
    });
    form.reset();
    showNameInput.focus();
  }
  saveEpisodes(episodes);
  render();
}

function handleFilterChange() {
  filterRadios.forEach(function (radio) {
    if (radio.checked) currentFilter = radio.value;
  });
  render();
}

/** @param {Event} event */
function handleQueueClick(event) {
  var btn = event.target.closest('button[data-action]');
  if (!btn) return;

  var id = btn.dataset.id;
  var action = btn.dataset.action;
  var index = episodes.findIndex(function (e) { return e.id === id; });
  if (index === -1) return;

  switch (action) {
    case 'toggle-listened':
      episodes[index].listened = !episodes[index].listened;
      break;
    case 'edit':
      startEditing(id);
      return;
    case 'delete':
      episodes.splice(index, 1);
      break;
    case 'move-up':
      if (index > 0) {
        var temp = episodes[index - 1];
        episodes[index - 1] = episodes[index];
        episodes[index] = temp;
      }
      break;
    case 'move-down':
      if (index < episodes.length - 1) {
        var temp = episodes[index + 1];
        episodes[index + 1] = episodes[index];
        episodes[index] = temp;
      }
      break;
  }

  saveEpisodes(episodes);
  render();
}

/* ─── Init ─── */

function init() {
  if (document.fonts) {
    document.documentElement.classList.add('fonts-loading');
    document.fonts.ready.then(function () {
      document.documentElement.classList.remove('fonts-loading');
    });
  }

  episodes = loadEpisodes();

  notesInput.addEventListener('input', updateCharCounter);
  searchInput.addEventListener('input', function () {
    searchTerm = searchInput.value;
    render();
  });
  cancelBtn.addEventListener('click', function () {
    cancelEditing();
    render();
  });
  form.addEventListener('submit', handleSubmit);

  filterRadios.forEach(function (radio) {
    radio.addEventListener('change', handleFilterChange);
  });

  queueList.addEventListener('click', handleQueueClick);

  updateCharCounter();
  render();

  if (episodes.length === 0) {
    showNameInput.focus();
  }
}

document.addEventListener('DOMContentLoaded', init);
