'use strict';

/* ── Pure function copies for testing ── */

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

/* ── Tests ── */

let pass = 0;
let fail = 0;

function test(description, fn) {
  try {
    fn();
    pass++;
  } catch (e) {
    console.error('\u2716 ' + description + ': ' + e.message);
    fail++;
  }
}

/* validateShowName */
test('showName rejects empty string', function () {
  console.assert(validateShowName('') !== null, 'empty string should error');
});
test('showName rejects whitespace only', function () {
  console.assert(validateShowName('   ') !== null, 'whitespace should error');
});
test('showName accepts valid name', function () {
  console.assert(validateShowName('Radiolab') === null, 'valid name should pass');
});
test('showName rejects over 100 chars', function () {
  console.assert(validateShowName('A'.repeat(101)) !== null, 'over 100 should error');
});
test('showName accepts exactly 100 chars', function () {
  console.assert(validateShowName('A'.repeat(100)) === null, '100 chars should pass');
});
test('showName rejects null/undefined', function () {
  console.assert(validateShowName(null) !== null, 'null should error');
  console.assert(validateShowName(undefined) !== null, 'undefined should error');
});

/* validateEpisodeTitle */
test('episodeTitle rejects empty string', function () {
  console.assert(validateEpisodeTitle('') !== null, 'empty should error');
});
test('episodeTitle accepts valid title', function () {
  console.assert(validateEpisodeTitle('The Universe in a Grain of Sand') === null, 'valid title should pass');
});
test('episodeTitle rejects over 200 chars', function () {
  console.assert(validateEpisodeTitle('A'.repeat(201)) !== null, 'over 200 should error');
});
test('episodeTitle accepts exactly 200 chars', function () {
  console.assert(validateEpisodeTitle('A'.repeat(200)) === null, '200 chars should pass');
});

/* validateNotes */
test('notes accepts empty string (optional)', function () {
  console.assert(validateNotes('') === null, 'empty notes should pass');
});
test('notes accepts valid note', function () {
  console.assert(validateNotes('Interesting episode about space') === null, 'valid notes should pass');
});
test('notes rejects over 500 chars', function () {
  console.assert(validateNotes('A'.repeat(501)) !== null, 'over 500 should error');
});

/* formatDate */
test('formatDate returns empty string for null', function () {
  console.assert(formatDate(null) === '', 'null should return empty');
});
test('formatDate returns empty string for undefined', function () {
  console.assert(formatDate(undefined) === '', 'undefined should return empty');
});
test('formatDate returns empty string for invalid date', function () {
  console.assert(formatDate('not-a-date') === '', 'invalid date should return empty');
});
test('formatDate returns "Added today" for today', function () {
  const today = new Date().toISOString();
  console.assert(formatDate(today) === 'Added today', 'today should match');
});
test('formatDate returns "Added yesterday" for yesterday', function () {
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  console.assert(formatDate(yesterday) === 'Added yesterday', 'yesterday should match');
});

/* ── Summary ── */

console.log('-------------------');
console.log('Results: ' + pass + ' passed, ' + fail + ' failed out of ' + (pass + fail));
if (fail === 0) {
  console.log('All tests passed!');
} else {
  console.error(fail + ' test(s) failed.');
}
