# Rockstar Life

Rockstar Life is a dependency-free browser game. Open `index.html` directly or serve the repository with any static web server.

## Expanded game systems

- Artist creation with genre, origin story, stage name, hometown, and profile styles
- Songwriting, singles, albums, charts, streaming, sales, and certifications
- Label offers with advances, royalties, creative control, and contract buyouts
- Rival artists, collaborations, public feuds, trends, and industry headlines
- Tour planning with cities, venues, production levels, attendance, and profit
- Awards, records, discography, career headlines, and shareable career cards
- Daily and weekly challenges, deeper relationships, and generational legacy inheritance
- Three manual save slots plus JSON import/export alongside the normal autosave
- Sound, ambient music, large text, high contrast, reduced motion, and content settings
- Installable offline-capable PWA support

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
assets/js/expansion.js           Music, labels, touring, rivals, challenges, saves, and settings
assets/js/game-over.js           Legacy scoring, death screen, and app startup
manifest.webmanifest             Installable app metadata
service-worker.js                Offline caching and update behavior
```

The JavaScript files are classic scripts rather than ES modules so the existing inline button handlers and direct `file://` usage continue to work. Their order in `index.html` is significant because later systems build on globals defined by earlier ones.

## Local development

No build step is required. For a local HTTP server, run:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.
