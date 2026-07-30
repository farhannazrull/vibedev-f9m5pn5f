'use strict';

/* ===== Podcast Queue Manager ===== */
/* ── Data / Pure Logic ── */

const STORAGE_KEY = 'podcast-queue';

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

function saveEpisodes(episodes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(episodes));
  } catch (e) {
    console.warn('Failed to save episodes to localStorage:', e);
  }
}

function validateShowName(value) {
  const trimmed = (value || '').trim();
  if (trimmed.length === 0) return 'Show name is required.';
  if (trimmed.length > 100) return 'Show name must be 100 characters or fewer.';
  return null;
}

function validateEpisodeTitle(value) {
  const trimmed = (value || '').trim();
  if (trimmed.length === 0) return 'Episode title is required.';
  if (trimmed.length > 200) return 'Episode title must be 200 characters or fewer.';
  return null;
}

function validateNotes(value) {
  const trimmed = (value || '').trim();
  if (trimmed.length > 500) return 'Notes must be 500 characters or fewer.';
  return null;
}

function validateForm(showName, episodeTitle, notes) {
  return {
    showName: validateShowName(showName),
    episodeTitle: validateEpisodeTitle(episodeTitle),
    notes: validateNotes(notes),
  };
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Added today';
  if (diffDays === 1) return 'Added yesterday';
  if (diffDays < 7) return 'Added ' + diffDays + ' days ago';
  if (diffDays < 30) return 'Added ' + Math.floor(diffDays / 7) + ' weeks ago';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ── DOM / Rendering ── */

function createButton(text, className, ariaLabel, dataAction, episodeId) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.setAttribute('aria-label', ariaLabel);
  btn.setAttribute('data-action', dataAction);
  if (episodeId) btn.setAttribute('data-id', episodeId);
  btn.textContent = text;
  return btn;
}

function createEpisodeCard(episode, index, total) {
  const li = document.createElement('li');
  li.className = 'episode-card' + (episode.listened ? ' listened' : '');
  li.setAttribute('role', 'listitem');
  li.dataset.id = episode.id;

  const showEl = document.createElement('div');
  showEl.className = 'episode-show';
  showEl.textContent = episode.showName || 'Untitled Show';

  const titleEl = document.createElement('div');
  titleEl.className = 'episode-title';
  titleEl.textContent = episode.episodeTitle || 'Untitled Episode';

  const notesEl = document.createElement('div');
  notesEl.className = 'episode-notes';
  if (episode.notes && episode.notes.trim()) {
    notesEl.textContent = episode.notes;
  } else {
    notesEl.style.display = 'none';
  }

  const addedAt = episode.addedAt || '';
  const metaEl = document.createElement('div');
  metaEl.className = 'episode-meta';
  metaEl.textContent = formatDate(addedAt);

  const actionsEl = document.createElement('div');
  actionsEl.className = 'episode-actions';

  const moveUpBtn = createButton('\u25B2', 'btn btn-icon move-up', 'Move up', 'move-up', episode.id);
  moveUpBtn.disabled = index === 0;

  const moveDownBtn = createButton('\u25BC', 'btn btn-icon move-down', 'Move down', 'move-down', episode.id);
  moveDownBtn.disabled = index === total - 1;

  const listenBtn = createButton(
    episode.listened ? '\u2705' : '\u25CB',
    'btn btn-icon listened-toggle' + (episode.listened ? ' is-listened' : ''),
    episode.listened ? 'Mark as unlistened' : 'Mark as listened',
    'toggle-listened',
    episode.id
  );

  const deleteBtn = createButton('\u2716', 'btn btn-icon delete-btn', 'Delete episode', 'delete', episode.id);

  actionsEl.appendChild(moveUpBtn);
  actionsEl.appendChild(moveDownBtn);
  actionsEl.appendChild(listenBtn);
  actionsEl.appendChild(deleteBtn);

  li.appendChild(showEl);
  li.appendChild(titleEl);
  li.appendChild(notesEl);
  li.appendChild(metaEl);
  li.appendChild(actionsEl);

  return li;
}

function renderQueue(episodes, filter, listEl, emptyEl, statusEl) {
  var filtered;
  if (filter === 'unlistened') {
    filtered = episodes.filter(function (e) { return !e.listened; });
  } else if (filter === 'listened') {
    filtered = episodes.filter(function (e) { return e.listened; });
  } else {
    filtered = episodes;
  }

  listEl.innerHTML = '';

  filtered.forEach(function (episode, index) {
    var card = createEpisodeCard(episode, index, filtered.length);
    listEl.appendChild(card);
  });

  var hasItems = filtered.length > 0;
  emptyEl.hidden = hasItems;
  emptyEl.textContent = episodes.length === 0
    ? 'No episodes yet. Add one above!'
    : 'No episodes match this filter.';

  var totalCount = episodes.length;
  var unlistenedCount = episodes.filter(function (e) { return !e.listened; }).length;
  statusEl.textContent = totalCount + ' episode' + (totalCount !== 1 ? 's' : '')
    + (unlistenedCount > 0 ? ' \u00B7 ' + unlistenedCount + ' unlistened' : '');
}

/* ─── Init ─── */

var episodes = [];
var currentFilter = 'all';

var form = document.getElementById('add-form');
var showNameInput = document.getElementById('show-name');
var episodeTitleInput = document.getElementById('episode-title');
var notesInput = document.getElementById('episode-notes');
var showNameError = document.getElementById('show-name-error');
var episodeTitleError = document.getElementById('episode-title-error');
var notesError = document.getElementById('notes-error');
var queueList = document.getElementById('queue-list');
var emptyState = document.getElementById('empty-state');
var queueStatus = document.getElementById('queue-status');
var filterRadios = document.querySelectorAll('input[name="filter"]');

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
  renderQueue(episodes, currentFilter, queueList, emptyState, queueStatus);
}

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

  var episode = {
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

function handleFilterChange() {
  filterRadios.forEach(function (radio) {
    if (radio.checked) currentFilter = radio.value;
  });
  render();
}

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
