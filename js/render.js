'use strict';

/** @param {string} isoString @returns {string} */
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

/** @returns {HTMLButtonElement} */
function createButton(text, className, ariaLabel, dataAction, episodeId) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.setAttribute('aria-label', ariaLabel);
  btn.setAttribute('data-action', dataAction);
  if (episodeId) btn.setAttribute('data-id', episodeId);
  btn.textContent = text;
  return btn;
}

/** @returns {HTMLLIElement} */
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

  const editBtn = createButton('\u270F', 'btn btn-icon edit-btn', 'Edit episode', 'edit', episode.id);
  const deleteBtn = createButton('\u2716', 'btn btn-icon delete-btn', 'Delete episode', 'delete', episode.id);

  actionsEl.appendChild(moveUpBtn);
  actionsEl.appendChild(moveDownBtn);
  actionsEl.appendChild(listenBtn);
  actionsEl.appendChild(editBtn);
  actionsEl.appendChild(deleteBtn);

  li.appendChild(showEl);
  li.appendChild(titleEl);
  li.appendChild(notesEl);
  li.appendChild(metaEl);
  li.appendChild(actionsEl);

  return li;
}

/**
 * @param {Array} episodes
 * @param {string} filter
 * @param {string} searchTerm
 * @param {HTMLElement} listEl
 * @param {HTMLElement} emptyEl
 * @param {HTMLElement} statusEl
 */
function renderQueue(episodes, filter, searchTerm, listEl, emptyEl, statusEl) {
  var search = (searchTerm || '').toLowerCase().trim();
  var preFiltered;
  if (filter === 'unlistened') {
    preFiltered = episodes.filter(function (e) { return !e.listened; });
  } else if (filter === 'listened') {
    preFiltered = episodes.filter(function (e) { return e.listened; });
  } else {
    preFiltered = episodes;
  }

  var filtered;
  if (search) {
    filtered = preFiltered.filter(function (e) {
      return (e.showName && e.showName.toLowerCase().indexOf(search) !== -1)
        || (e.episodeTitle && e.episodeTitle.toLowerCase().indexOf(search) !== -1);
    });
  } else {
    filtered = preFiltered;
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

export { renderQueue, formatDate };
