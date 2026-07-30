'use strict';

/**
 * Format a date string for display.
 * @param {string} isoString
 * @returns {string}
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Added today';
  if (diffDays === 1) return 'Added yesterday';
  if (diffDays < 7) return `Added ${diffDays} days ago`;
  if (diffDays < 30) return `Added ${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Create a button element.
 * @param {string} text
 * @param {string} className
 * @param {string} ariaLabel
 * @param {string} dataAction
 * @param {string} [episodeId]
 * @returns {HTMLButtonElement}
 */
function createButton(text, className, ariaLabel, dataAction, episodeId) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.setAttribute('aria-label', ariaLabel);
  btn.setAttribute('data-action', dataAction);
  if (episodeId) {
    btn.setAttribute('data-id', episodeId);
  }
  btn.textContent = text;
  return btn;
}

/**
 * Build an episode card element.
 * @param {Object} episode
 * @param {number} index
 * @param {number} total
 * @returns {HTMLLIElement}
 */
function createEpisodeCard(episode, index, total) {
  const li = document.createElement('li');
  li.className = 'episode-card' + (episode.listened ? ' listened' : '');
  li.setAttribute('role', 'listitem');
  li.dataset.id = episode.id;

  const showEl = document.createElement('div');
  showEl.className = 'episode-show';
  showEl.textContent = episode.showName;

  const titleEl = document.createElement('div');
  titleEl.className = 'episode-title';
  titleEl.textContent = episode.episodeTitle;

  const notesEl = document.createElement('div');
  notesEl.className = 'episode-notes';
  if (episode.notes && episode.notes.trim()) {
    notesEl.textContent = episode.notes;
  } else {
    notesEl.style.display = 'none';
  }

  const metaEl = document.createElement('div');
  metaEl.className = 'episode-meta';
  metaEl.textContent = formatDate(episode.addedAt);

  const actionsEl = document.createElement('div');
  actionsEl.className = 'episode-actions';

  const moveUpBtn = createButton(
    '\u25B2',
    'btn btn-icon move-up',
    'Move up',
    'move-up',
    episode.id
  );
  moveUpBtn.disabled = index === 0;

  const moveDownBtn = createButton(
    '\u25BC',
    'btn btn-icon move-down',
    'Move down',
    'move-down',
    episode.id
  );
  moveDownBtn.disabled = index === total - 1;

  const listenBtn = createButton(
    episode.listened ? '\u2705' : '\u25CB',
    'btn btn-icon listened-toggle' + (episode.listened ? ' is-listened' : ''),
    episode.listened ? 'Mark as unlistened' : 'Mark as listened',
    'toggle-listened',
    episode.id
  );

  const deleteBtn = createButton(
    '\u2716',
    'btn btn-icon delete-btn',
    'Delete episode',
    'delete',
    episode.id
  );

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

/**
 * Render the episode queue into the DOM.
 * @param {Array} episodes
 * @param {string} filter - 'all', 'unlistened', or 'listened'
 * @param {HTMLElement} listEl
 * @param {HTMLElement} emptyEl
 * @param {HTMLElement} statusEl
 */
function renderQueue(episodes, filter, listEl, emptyEl, statusEl) {
  let filtered;
  if (filter === 'unlistened') {
    filtered = episodes.filter(function (e) { return !e.listened; });
  } else if (filter === 'listened') {
    filtered = episodes.filter(function (e) { return e.listened; });
  } else {
    filtered = episodes;
  }

  listEl.innerHTML = '';

  filtered.forEach(function (episode, index) {
    const card = createEpisodeCard(episode, index, filtered.length);
    listEl.appendChild(card);
  });

  const hasItems = filtered.length > 0;
  emptyEl.hidden = hasItems;
  emptyEl.textContent = episodes.length === 0
    ? 'No episodes yet. Add one above!'
    : 'No episodes match this filter.';

  const totalCount = episodes.length;
  const unlistenedCount = episodes.filter(function (e) { return !e.listened; }).length;
  statusEl.textContent = totalCount + ' episode' + (totalCount !== 1 ? 's' : '')
    + (unlistenedCount > 0 ? ' \u00B7 ' + unlistenedCount + ' unlistened' : '');
}

export { renderQueue, formatDate };
