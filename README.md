# Rockstar Life

Rockstar Life is a dependency-free browser game. Open `index.html` directly or serve the repository with any static web server.

## Project structure

```text
index.html                       Page structure and game screens
assets/css/game.css              Visual design, layout, and animation
assets/js/core.js                State, saves, utilities, rendering, and HUD
assets/js/menus.js               Menu navigation, summaries, assets, and businesses
assets/js/social-and-band.js     Friends, followers, crew, and band systems
assets/js/life-cycle.js          Aging, modal flow, prison, and yearly simulation
assets/js/events.js              Random life-event definitions
assets/js/actions.js             Player action handling and yearly lifestyle effects
assets/js/relationships.js       Dating, hookups, partners, and family systems
assets/js/game-over.js           Legacy scoring, death screen, and app startup
```

The JavaScript files are classic scripts rather than ES modules so the existing inline button handlers and direct `file://` usage continue to work. Their order in `index.html` is significant because later systems build on globals defined by earlier ones.

## Local development

No build step is required. For a local HTTP server, run:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.
