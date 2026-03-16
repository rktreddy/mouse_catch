# Mouse Catch

A cat & mouse chase game built with vanilla HTML5 Canvas. Pick a cat, chase the mouse, score points on contact.

## Play

Open `index.html` in a browser, or serve it:

```
npx serve .
```

Works on desktop and mobile. Installable as a PWA.

## Controls

| Input | Action |
|-------|--------|
| Left / Right arrow | Turn |
| Up arrow | Move forward |
| Down arrow | Move backward |
| Esc | Pause |
| Touch d-pad | Mobile controls (auto-detected) |

## Features

- 3 illustrated cat characters drawn with Canvas paths
- Progressive difficulty: mouse gets faster and smarter each level
- Score system with time bonuses and localStorage high scores
- Responsive design — scales from phone to desktop
- PWA with offline support
- Auto-pause on tab switch
- Paw print trails, proximity indicator, confetti on level complete

## Tech

Single `index.html` file. No dependencies, no build step. Service worker (`sw.js`) + manifest for PWA.
