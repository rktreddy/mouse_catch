# Mouse Catch

A cat & mouse chase game built with vanilla HTML5 Canvas. Pick a cat, chase the mouse, score points on contact.

**Play now: https://rktreddy.github.io/mouse_catch/**

## Controls

| Input | Action |
|-------|--------|
| Left / Right arrow | Turn |
| Up arrow | Move forward |
| Down arrow | Move backward |
| Esc | Pause |
| Touch d-pad | Mobile controls (auto-detected) |

## Features

- 3 illustrated cat characters drawn with Canvas paths (no images)
- Progressive difficulty: mouse gets faster and smarter each level
- Score system with time bonuses and localStorage high scores
- Responsive design — scales from phone to desktop
- DPI-aware rendering for crisp display on Retina screens
- PWA with offline support — installable on any device
- Touch controls with hold-to-repeat for mobile play
- Auto-pause on tab switch
- Paw print trails, proximity indicator, confetti on level complete

## Run Locally

```bash
npm install
npm run serve
```

## Build for Mobile

```bash
npm run android   # Opens Android Studio
npm run ios       # Opens Xcode
```

Requires [Android Studio](https://developer.android.com/studio) or [Xcode](https://developer.apple.com/xcode/) respectively.

## Project Structure

```
index.html             — All game logic, styles, and rendering
sw.js                  — Service worker for offline support
manifest.json          — PWA manifest
capacitor.config.json  — Native app config
icons/                 — App icons (SVG + PNG, all sizes)
STORE_LISTING.md       — App store descriptions and keywords
TUTORIAL.md            — Beginner-friendly code walkthrough
```

## Tech

- Vanilla HTML5 + CSS + JavaScript (no frameworks)
- Canvas 2D API for rendering
- Capacitor for Android/iOS wrapping
- GitHub Actions for auto-deploy to GitHub Pages
- Service Worker for offline PWA support
