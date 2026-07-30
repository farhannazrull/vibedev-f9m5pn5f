# Podcast Queue Manager

A single-page app to curate and manage a personal podcast episode queue. Built with vanilla JavaScript modules and neubrutalism design.

## Features

- **Add episodes** — show name, episode title, optional notes
- **Mark as listened** — visually distinct with strikethrough and muted styling
- **Delete episodes** — remove unwanted entries
- **Reorder queue** — up/down buttons with smooth FLIP animation
- **Edit episodes** — update show name, title, or notes after adding
- **Search filter** — filter by show name or episode title in real time
- **Status filter** — All / Unlistened / Listened
- **Character counter** — tracks note length with near-limit warning
- **localStorage persistence** — queue survives page refresh

## Run

Because ES modules require a local server:

```bash
bash serve.sh
```

Then open `http://localhost:8080` in your browser.

## Architecture

```
index.html          — semantic HTML with full accessibility
css/style.css       — neubrutalism design, 3 breakpoints
js/
  storage.js        — localStorage load/save with try/catch
  validation.js     — pure validation functions with JSDoc
  render.js         — DOM rendering with FLIP animation
  app.js            — entry point, event handlers, init
quick-test.js       — 18 console.assert tests
```

All data flows through pure functions separated from DOM manipulation. Event delegation handles queue actions. FLIP animation provides smooth reorder transitions.

## Tests

```bash
node quick-test.js
```
