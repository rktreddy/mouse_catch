# CLAUDE.md

## Project

Mouse Catch — A cat & mouse chase game. Player picks a cat, presses start, then uses arrow keys (or touch d-pad on mobile) to chase and catch mice on an open field. Auto-scores on contact. Progressive levels with smarter/faster mouse AI. Ships as a web app (GitHub Pages), PWA, and native app (Capacitor for Android/iOS).

## Architecture

Single-page HTML5 Canvas game with Capacitor wrapper for native builds.

```
index.html          — Game logic, styles, rendering (single file, no framework)
sw.js               — Service worker for offline PWA support
manifest.json       — PWA manifest with icons
capacitor.config.json — Capacitor config for native builds
package.json        — npm scripts for build, serve, and native platform commands
www/                — Build output (copied web files for Capacitor)
android/            — Generated Android Studio project (not tracked in git)
ios/                — Generated Xcode project (not tracked in git)
icons/              — SVG + PNG app icons at all store-required sizes
.github/workflows/  — GitHub Actions for auto-deploy to GitHub Pages
STORE_LISTING.md    — App store copy (descriptions, keywords, screenshots)
```

## How It Works

- **Controls**: Left/Right = turn (8 directions), Up = forward, Down = backward. Esc = pause. Touch d-pad on mobile.
- **Scoring**: Auto-catch on contact (CATCH_DIST=30px). 50 x level points per catch. Time bonus at level end. Best score in localStorage.
- **Levels**: Each level requires 3 + (level-1)x2 catches (capped at 15). Mouse speed: 1000ms to 400ms min. AI escape probability scales with level (capped at 60%).
- **Rendering**: 60fps canvas loop with lerp-smoothed movement. DPI-aware (devicePixelRatio). Dot pattern cached to offscreen canvas. Characters drawn with Canvas path API.
- **Responsive**: Fixed 720x520 internal resolution, CSS-scaled via aspect-ratio. Touch controls auto-shown on mobile via media query.

## Key Design Decisions

- Canvas renders at DPR scale (capped at 2x) for crisp display on Retina screens
- Touch controls only on `(hover: none) and (pointer: coarse)` devices
- Game auto-pauses on tab visibility change and window blur
- setTimeout IDs tracked and cleared on quit to prevent stale callbacks
- Turn and move actions rate-limited to prevent input flooding from touch hold
- Google Fonts loaded via preconnect link (non-render-blocking)

## Commands

```bash
npm run serve        # Local dev server
npm run build        # Copy web files to www/ for Capacitor
npm run cap:sync     # Build + sync to native platforms
npm run android      # Open in Android Studio
npm run ios          # Open in Xcode
npm run icons        # Regenerate SVG icons
```

## Deployment

- **Web**: Auto-deploys to GitHub Pages on push to main
- **Live URL**: https://rktreddy.github.io/mouse_catch/
- **Android/iOS**: Build via Capacitor (`npm run android` / `npm run ios`)
