# CLAUDE.md

## Project

Mouse Catch — A cat & mouse chase game. Player picks a cat, presses start, then uses arrow keys to chase and catch mice on an open field. Auto-scores on contact. Progressive levels with smarter/faster mouse AI.

## Architecture


Single-page HTML5 Canvas game. No build step, no frameworks.

- `index.html` — All game logic, styles, and rendering (canvas-based, illustrated characters)
- `sw.js` — Service worker for offline PWA support
- `manifest.json` — PWA manifest

## How It Works

- **Controls**: Left/Right arrows = turn (8 directions), Up = move forward, Down = move backward. Esc = pause. Touch d-pad on mobile.
- **Scoring**: Auto-catch on contact (CATCH_DIST=30px). 50 × level points per catch. Time bonus at level end. Best score in localStorage.
- **Levels**: Each level requires 3 + (level-1)×2 catches (capped at 15). Mouse speed increases per level (1000ms → 400ms min). Mouse AI escape probability scales with level (capped at 60%).
- **Rendering**: 60fps canvas loop with lerp-smoothed movement. Dot pattern cached to offscreen canvas. Characters drawn with Canvas path API (no images/sprites).

## Key Design Decisions

- Canvas internal resolution is fixed 720×520; CSS scales it responsively via aspect-ratio
- Touch controls shown only on `(hover: none) and (pointer: coarse)` devices
- Game auto-pauses on tab visibility change
- setTimeout IDs tracked and cleared on quit to prevent stale callbacks

## Commands

- Serve locally: `npx serve .` (HTTPS needed for service worker)
- No build, no tests, no dependencies
