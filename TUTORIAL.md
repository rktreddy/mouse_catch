# Building Mouse Catch: A Complete Beginner's Guide

This tutorial walks through how the Mouse Catch game was built from scratch using only HTML, CSS, and JavaScript. No frameworks, no build tools — just the fundamentals of web development.

---

## Table of Contents

1. [Technology Summary](#1-technology-summary)
2. [High-Level Walkthrough](#2-high-level-walkthrough)
3. [Detailed Code Review](#3-detailed-code-review)
   - [HTML Structure](#31-html-structure)
   - [CSS Styling and Responsiveness](#32-css-styling-and-responsiveness)
   - [Game State and Configuration](#33-game-state-and-configuration)
   - [Drawing Characters with Canvas](#34-drawing-characters-with-canvas)
   - [The Game Loop](#35-the-game-loop)
   - [Player Input (Keyboard and Touch)](#36-player-input-keyboard-and-touch)
   - [Mouse AI](#37-mouse-ai)
   - [Collision Detection and Scoring](#38-collision-detection-and-scoring)
   - [Progressive Web App (PWA)](#39-progressive-web-app-pwa)
   - [Responsive Design and Mobile Support](#310-responsive-design-and-mobile-support)
4. [Five Suggestions for Improvement](#4-five-suggestions-for-improvement)

---

## 1. Technology Summary

### What we used

| Technology | What it does | Why we chose it |
|-----------|-------------|-----------------|
| **HTML5** | Page structure and layout | Every browser supports it. No install needed. |
| **CSS3** | Styling, animations, responsive layout | Built into browsers. Media queries handle mobile. |
| **JavaScript (ES6+)** | Game logic, rendering, input handling | The only programming language browsers run natively. |
| **Canvas 2D API** | Drawing the game graphics | Lets us draw shapes, lines, and animations at 60fps. |
| **Service Worker** | Offline caching for PWA | Makes the game work without internet after first load. |
| **Capacitor** | Wrapping the web app as a native mobile app | Turns our HTML game into an Android/iOS app with one codebase. |
| **GitHub Pages** | Free hosting | Deploys automatically when we push code. |

### What we did NOT use

- No React, Vue, or Angular — the game is simple enough for vanilla JS
- No game engines (Phaser, Unity) — Canvas API is sufficient for 2D
- No image files — all characters are drawn with code (Canvas paths)
- No database — high scores stored in the browser's localStorage

### Key concepts you'll learn

- **Game loop**: How games render frames at 60fps
- **Canvas drawing**: How to draw shapes, lines, and characters with code
- **State management**: How to track game data (score, positions, level)
- **Event handling**: How to respond to keyboard and touch input
- **Responsive design**: How to make one layout work on phones and desktops
- **PWA basics**: How to make a website installable like a native app

---

## 2. High-Level Walkthrough

The game is built as a **single HTML file** (`index.html`) that contains everything: the HTML structure, CSS styles, and JavaScript game logic. Here's how the pieces fit together:

### The three layers

```
+---------------------------+
|  HTML (Structure)          |  <-- What's on the page: screens, buttons, canvas
+---------------------------+
|  CSS (Presentation)        |  <-- How it looks: colors, layout, animations
+---------------------------+
|  JavaScript (Behavior)     |  <-- How it works: game logic, drawing, input
+---------------------------+
```

### Game flow

```
[Cat Selection Screen]
        |
    Pick a cat
        |
    Press "Start"
        |
[Game Screen]  <---------+
   |                      |
   | Arrow keys / touch   |
   | move the cat         |
   |                      |
   | Cat touches mouse    |
   | = score points       |
   |                      |
   | All catches done?    |
   |     No  --> respawn  |
   |     Yes --> [Win Screen]
   |                 |
   |           "Next Level"
   |                 |
   +-----------------+
```

### The game loop (simplified)

Every single frame (60 times per second), the game does this:

```
1. Move cat smoothly toward its target position
2. Move mouse smoothly toward its target position
3. Clear the screen
4. Draw the background dots
5. Draw paw print trails
6. Check if cat is touching the mouse (collision)
7. Draw the mouse
8. Draw the cat
9. Schedule the next frame
```

This loop is the heart of any game. Let's see how it all works in code.

---

## 3. Detailed Code Review

### 3.1 HTML Structure

The HTML defines four main sections, but only one is visible at a time:

```html
<!-- 1. Cat Selection Screen — shown first -->
<div id="select-screen">
  <h1 class="title">Mouse Catch</h1>
  <div id="cat-selection">
    <div class="cat-card" data-cat="orange">...</div>
    <div class="cat-card" data-cat="gray">...</div>
    <div class="cat-card" data-cat="black">...</div>
  </div>
  <button id="start-btn" disabled>Start Game</button>
</div>

<!-- 2. Game Screen — shown during gameplay -->
<div id="game-screen">
  <div id="hud"><!-- Score, Time, Level, Catches, Best --></div>
  <div id="game-area">
    <canvas id="game-canvas"></canvas>
  </div>
  <div id="touch-controls"><!-- Mobile d-pad buttons --></div>
</div>

<!-- 3. Pause Overlay — shown when paused -->
<div id="pause-overlay" class="overlay">...</div>

<!-- 4. Win Overlay — shown after completing a level -->
<div id="win-overlay" class="overlay">...</div>
```

**Key concept: `data-*` attributes.** Each cat card has `data-cat="orange"` (or gray/black). This is a custom HTML attribute that lets us store data directly on an element. JavaScript reads it with `el.dataset.cat`.

**Key concept: The `<canvas>` element.** This is a blank drawing surface. Unlike regular HTML elements (divs, buttons), a canvas doesn't display anything by itself — you have to draw on it with JavaScript.

### 3.2 CSS Styling and Responsiveness

The CSS uses modern techniques to work on any screen size:

```css
/* The body centers everything vertically and horizontally */
body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;   /* dvh = dynamic viewport height, accounts for mobile browser chrome */
}

/* clamp() picks a value between a min and max, scaling with viewport */
.title {
  font-size: clamp(1.6rem, 6vw, 2.6rem);
  /* On a 375px phone: 6vw = 22.5px, clamped to min 1.6rem (25.6px)
     On a 1200px desktop: 6vw = 72px, clamped to max 2.6rem (41.6px) */
}

/* The game canvas scales to fit its container while keeping its proportions */
#game-area {
  width: 100%;
  max-width: min(720px, 100%);
  aspect-ratio: 720 / 520;  /* Always maintains this shape */
}

#game-canvas {
  width: 100%;    /* CSS scales the canvas to fill the container */
  height: 100%;   /* But internal resolution stays 720x520 */
}
```

**Key concept: Internal vs. display resolution.** The canvas has a fixed *internal* resolution of 720x520 pixels (set in JavaScript). CSS then stretches or shrinks it to fit the screen. This means the game logic always works with the same coordinate system regardless of screen size.

**Key concept: Media queries for touch devices.**

```css
/* This only applies on devices with a touchscreen and no hover (phones/tablets) */
@media (hover: none) and (pointer: coarse) {
  #touch-controls.active { display: flex; }  /* Show d-pad */
  .game-hint { display: none; }               /* Hide "Arrow keys" text */
}
```

### 3.3 Game State and Configuration

At the top of the JavaScript, we define constants and variables that track everything:

```javascript
// === Constants (never change) ===
const CANVAS_W = 720;       // Internal canvas width
const CANVAS_H = 520;       // Internal canvas height
const STEP = 40;             // How many pixels the cat moves per step
const CAT_SIZE = 44;         // Size of the cat drawing
const MOUSE_SIZE = 30;       // Size of the mouse drawing
const CATCH_DIST = 30;       // How close cat must be to "touch" mouse
const MOVE_COOLDOWN_MS = 100; // Minimum time between moves (prevents input flooding)

// === 8-direction system ===
// Index 0 = up, 1 = up-right, 2 = right, etc.
const DIR_DX = [0, 1, 1, 1, 0, -1, -1, -1];  // X change for each direction
const DIR_DY = [-1, -1, 0, 1, 1, 1, 0, -1];   // Y change for each direction

// === Variables (change during gameplay) ===
let catX, catY, catAngle;     // Cat's current position and facing direction
let mouseX, mouseY;           // Mouse's current position
let score = 0;                // Current score
let level = 1;                // Current level
let gameRunning = false;      // Is the game active?
let gamePaused = false;       // Is the game paused?
```

**Key concept: `const` vs `let`.** Constants (`const`) are values that never change — like the canvas size or step distance. Variables (`let`) are values that change during gameplay — like the score or positions.

**Key concept: The direction system.** Instead of tracking an angle in degrees, we use 8 indexed directions (0-7). `DIR_DX` and `DIR_DY` tell us how much X and Y change for each direction. For example, direction 0 (up) has DX=0 and DY=-1, meaning "don't move horizontally, move up by 1 unit."

### 3.4 Drawing Characters with Canvas

The cat and mouse are drawn entirely with code — no image files. Here's a simplified version of the cat drawing:

```javascript
function drawCat(c, x, y, size, palette, facing, rotation) {
  const s = size;
  const p = palette;  // { body: '#e8934a', dark: '#c46e2a', ear: '#e86b8a', ... }

  c.save();                        // Save the current canvas state
  c.translate(x, y);              // Move the origin to the cat's position
  c.rotate(rotation - Math.PI/2); // Rotate to face the right direction

  // Draw the body (a circle)
  c.beginPath();
  c.arc(0, 0, s * 0.42, 0, Math.PI * 2);
  c.fillStyle = p.body;      // Orange, gray, or black
  c.fill();                   // Fill the circle
  c.strokeStyle = p.dark;    // Darker outline
  c.lineWidth = 2.5;
  c.stroke();                // Draw the outline

  // Draw an ear (a triangle)
  c.beginPath();
  c.moveTo(-s * 0.22, -s * 0.34);  // Start point
  c.lineTo(-s * 0.16, -s * 0.58);  // Tip of ear
  c.lineTo(-s * 0.02, -s * 0.36);  // End point
  c.closePath();
  c.fillStyle = p.dark;
  c.fill();

  // Draw an eye (an ellipse)
  c.fillStyle = p.eye;
  c.beginPath();
  c.ellipse(-s * 0.12, -s * 0.08, s * 0.055, s * 0.07, 0, 0, Math.PI * 2);
  c.fill();

  // ... more features: whiskers, nose, tail, etc.

  c.restore();  // Restore the canvas state (undoes translate/rotate)
}
```

**Key concept: `save()` and `restore()`.** Canvas transformations (translate, rotate, scale) affect ALL future drawing. `save()` remembers the current state and `restore()` resets it back. Without this, every object would inherit the previous object's position and rotation.

**Key concept: Drawing paths.** Canvas drawing works like a pen:
1. `beginPath()` — pick up the pen
2. `moveTo(x, y)` — move to a starting point
3. `lineTo(x, y)` / `arc()` / `ellipse()` — draw lines and shapes
4. `fill()` or `stroke()` — fill the shape or draw its outline

### 3.5 The Game Loop

The game loop is the function that runs 60 times per second to update and draw everything:

```javascript
function renderFrame() {
  // 1. Smooth movement using linear interpolation (lerp)
  catX = lerp(catX, catTargetX, 0.25);   // Move 25% closer each frame
  catY = lerp(catY, catTargetY, 0.25);
  mouseX = lerp(mouseX, mouseTargetX, 0.18);
  mouseY = lerp(mouseY, mouseTargetY, 0.18);

  // 2. Draw background (from cached offscreen canvas — fast!)
  ctx.drawImage(dotCanvas, 0, 0, CANVAS_W, CANVAS_H);

  // 3. Draw paw prints trail
  drawPawPrints(ctx);

  // 4. Check collision
  if (gameRunning && !catchCooldown && !levelEnding) {
    if (Math.hypot(catTargetX - mouseTargetX, catTargetY - mouseTargetY) < CATCH_DIST) {
      onCatchMouse();
    }
  }

  // 5. Draw mouse, then cat (cat on top)
  drawMouse(ctx, mouseX, mouseY, MOUSE_SIZE, mouseDir, mouseOpacity);
  drawCat(ctx, catX, catY, CAT_SIZE, palette, null, catRad);

  // 6. Schedule next frame
  if (gameRunning || gamePaused) {
    animFrame = requestAnimationFrame(renderFrame);
  }
}
```

**Key concept: `requestAnimationFrame`.** This is how browsers run animations. It tells the browser: "call this function before the next screen refresh." This gives us smooth 60fps animation that automatically pauses when the tab is hidden.

**Key concept: Linear interpolation (lerp).** Instead of teleporting the cat from point A to point B, we move it 25% closer each frame. This creates smooth, natural-looking movement:

```javascript
function lerp(a, b, t) {
  return a + (b - a) * Math.min(t, 1);
}
// lerp(0, 100, 0.25) = 25    (25% of the way)
// lerp(25, 100, 0.25) = 43.75 (25% of remaining distance)
// lerp(43.75, 100, 0.25) = 57.8 ... and so on, decelerating
```

**Key concept: Offscreen canvas caching.** The dot pattern background never changes, so we draw it once to a hidden canvas and then copy it each frame with `drawImage()`. This is much faster than redrawing hundreds of dots 60 times per second.

```javascript
const dotCanvas = document.createElement('canvas');  // Create hidden canvas
dotCanvas.width = CANVAS_W * DPR;
dotCanvas.height = CANVAS_H * DPR;
// Draw all dots once...

// Then in the game loop, just copy:
ctx.drawImage(dotCanvas, 0, 0, CANVAS_W, CANVAS_H);
```

### 3.6 Player Input (Keyboard and Touch)

The game uses two input systems that both call the same functions:

```javascript
// === Shared movement functions ===
function turnLeft() {
  catAngle = (catAngle + 7) % 8;  // +7 is the same as -1 in mod 8
}

function turnRight() {
  catAngle = (catAngle + 1) % 8;
}

function moveForward() {
  moveCat(catAngle);  // Move in current facing direction
}

function moveBackward() {
  moveCat((catAngle + 4) % 8);  // +4 = opposite direction in 8-direction system
}
```

**Key concept: Modular arithmetic.** `(catAngle + 7) % 8` wraps around. If catAngle is 0 (up) and we turn left: `(0 + 7) % 8 = 7` (up-left). This avoids negative numbers and keeps the angle in the 0-7 range.

```javascript
// === Keyboard input ===
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft':  e.preventDefault(); turnLeft(); break;
    case 'ArrowRight': e.preventDefault(); turnRight(); break;
    case 'ArrowUp':    e.preventDefault(); moveForward(); break;
    case 'ArrowDown':  e.preventDefault(); moveBackward(); break;
  }
});

// === Touch input (hold-to-repeat) ===
function bindTouch(id, action) {
  const el = document.getElementById(id);
  let interval = null;

  const start = (e) => {
    e.preventDefault();          // Prevent page scrolling
    action();                     // Fire once immediately
    interval = setInterval(action, 120);  // Then repeat every 120ms while held
  };

  const stop = () => {
    clearInterval(interval);     // Stop repeating when finger lifts
  };

  el.addEventListener('touchstart', start, { passive: false });
  el.addEventListener('touchend', stop);
}

bindTouch('touch-left', turnLeft);
bindTouch('touch-right', turnRight);
bindTouch('touch-fwd', moveForward);
bindTouch('touch-back', moveBackward);
```

**Key concept: `e.preventDefault()`.** Without this, pressing arrow keys would scroll the page and touching buttons would trigger browser gestures. `preventDefault()` stops the browser's default behavior so only our game logic runs.

**Key concept: `setInterval` for hold-to-repeat.** When the player holds a touch button, we want continuous movement — not just one step. `setInterval(action, 120)` calls the action function every 120 milliseconds until the player lifts their finger.

### 3.7 Mouse AI

The mouse moves automatically on a timer. At higher levels, it tries to run away from the cat:

```javascript
function moveMouse() {
  // All 8 possible directions the mouse could move
  const dirs = [[0,-STEP], [0,STEP], [-STEP,0], [STEP,0],
                [-STEP,-STEP], [STEP,-STEP], [-STEP,STEP], [STEP,STEP]];

  // Higher levels: mouse tries to move AWAY from cat
  if (level >= 2 && Math.random() < Math.min(0.6, 0.25 + level * 0.05)) {
    // Sort directions by distance from cat (farthest first)
    dirs.sort((a, b) => {
      const distA = Math.hypot(mouseTargetX + a[0] - catTargetX,
                                mouseTargetY + a[1] - catTargetY);
      const distB = Math.hypot(mouseTargetX + b[0] - catTargetX,
                                mouseTargetY + b[1] - catTargetY);
      return distB - distA;  // Largest distance first
    });
  } else {
    // Random shuffle (level 1 or random chance)
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];  // Fisher-Yates shuffle
    }
  }

  // Pick the first valid direction (stays within bounds)
  for (const [dx, dy] of dirs) {
    const nx = mouseTargetX + dx;
    const ny = mouseTargetY + dy;
    if (nx >= 30 && nx <= CANVAS_W - 30 && ny >= 30 && ny <= CANVAS_H - 30) {
      mouseTargetX = nx;
      mouseTargetY = ny;
      break;
    }
  }
}
```

**Key concept: `Math.hypot(a, b)`.** This calculates the straight-line distance between two points: `sqrt(a^2 + b^2)`. We use it to find how far each possible move would put the mouse from the cat.

**Key concept: Probability scaling.** `Math.min(0.6, 0.25 + level * 0.05)` means the mouse has a 30% chance to flee at level 2, 35% at level 3, gradually increasing to a cap of 60%. This makes the game progressively harder without becoming impossible.

### 3.8 Collision Detection and Scoring

Collision detection checks if the cat is close enough to the mouse:

```javascript
// In the render loop:
const dist = Math.hypot(catTargetX - mouseTargetX, catTargetY - mouseTargetY);
if (dist < CATCH_DIST) {   // CATCH_DIST = 30 pixels
  onCatchMouse();
}
```

**Why target positions, not visual positions?** The visual positions (`catX`, `catY`) are smoothly interpolated and lag behind. Using target positions (`catTargetX`, `catTargetY`) ensures the catch happens when the player intends it, not when the animation catches up.

```javascript
function onCatchMouse() {
  catchCooldown = true;   // Prevent double-scoring
  catchCount++;

  const catchPoints = 50 * level;   // Higher levels = more points
  score += catchPoints;
  scoreDisplay.textContent = score;  // Update the HUD

  // Save high score to browser storage
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('mouseCatchBest', bestScore);
  }

  // Level complete?
  if (catchCount >= totalCatchesForLevel) {
    levelEnding = true;
    winLevelTimeout = setTimeout(() => winLevel(), 400);  // Brief delay for feedback
    return;
  }

  // Not done yet — respawn the mouse somewhere far from the cat
  respawnMouse();
  cooldownTimeout = setTimeout(() => { catchCooldown = false; }, 600);
}
```

**Key concept: `localStorage`.** This is the browser's built-in key-value storage. Data persists even after closing the browser. We use it to remember the player's high score between sessions. `localStorage.setItem('key', value)` saves data, `localStorage.getItem('key')` reads it.

**Key concept: Cooldown pattern.** After catching a mouse, we set `catchCooldown = true` to prevent the collision check from firing again immediately. After 600ms, we reset it. This gives time for the mouse to respawn and fade in.

### 3.9 Progressive Web App (PWA)

Three things make this game installable as an app:

**1. The manifest (`manifest.json`):**
```json
{
  "name": "Mouse Catch",
  "short_name": "MouseCatch",
  "start_url": "./index.html",
  "display": "standalone",    // Opens without browser chrome (like a native app)
  "theme_color": "#3a3226",   // Status bar color on mobile
  "icons": [{ "src": "...", "sizes": "any", "purpose": "any" }]
}
```

**2. The service worker (`sw.js`):**
```javascript
const CACHE_NAME = 'mouse-catch-v1';
const ASSETS = ['./', './index.html', './manifest.json'];

// On install: cache all game files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// On fetch: serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
```

**3. Registration in the HTML:**
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
```

**Key concept: How service workers work.** A service worker is a script that runs in the background, separate from your web page. It intercepts network requests and can serve cached files instead. This means after the first visit, the game loads instantly — even offline.

### 3.10 Responsive Design and Mobile Support

The game handles different screen sizes through several techniques:

**DPI-aware canvas rendering:**
```javascript
const DPR = Math.min(window.devicePixelRatio || 1, 2);  // Cap at 2x
canvas.width = CANVAS_W * DPR;    // 720 * 2 = 1440 actual pixels on Retina
canvas.height = CANVAS_H * DPR;   // 520 * 2 = 1040 actual pixels
ctx.scale(DPR, DPR);              // Scale drawing commands so we still use 720x520 coords
```

**Key concept: `devicePixelRatio`.** A Retina display has 2 or 3 physical pixels per CSS pixel. If we render a 720px canvas and display it at 720 CSS pixels on a 2x screen, it looks blurry. By rendering at 1440 physical pixels and CSS-scaling it down to 720, everything looks crisp.

**Auto-pause on tab switch:**
```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden && gameRunning && !gamePaused) {
    pauseGame();  // Pause timers so the mouse doesn't run away while you're gone
  }
});
```

---

## 4. Five Suggestions for Improvement

### 1. Extract CSS and JS into separate files

Currently everything is in one HTML file (~800 lines). As the game grows, this becomes hard to navigate. Splitting into `style.css` and `game.js` would improve maintainability:

```
index.html   — Structure only
style.css    — All styles
game.js      — All game logic
```

This also enables browser caching — the browser can cache CSS and JS separately from HTML.

### 2. Replace `setInterval` for the mouse AI with delta-time logic

The mouse moves on a `setInterval` timer, which doesn't account for frame timing. If the browser is busy, the mouse could move in bursts. A better approach would be to track elapsed time in the render loop:

```javascript
let mouseAccumulator = 0;
function renderFrame(timestamp) {
  const dt = timestamp - lastTimestamp;
  mouseAccumulator += dt;
  if (mouseAccumulator >= mouseSpeed) {
    mouseAccumulator -= mouseSpeed;
    moveMouse();
  }
}
```

This ties mouse movement to the render loop, ensuring consistent behavior regardless of browser performance.

### 3. Add a proper state machine for game screens

The game uses boolean flags (`gameRunning`, `gamePaused`, `levelEnding`, `catchCooldown`) to track state. With 4+ booleans, there are 16 possible combinations — most of which are invalid. A state machine would be clearer:

```javascript
const STATE = { MENU: 'menu', PLAYING: 'playing', PAUSED: 'paused',
                LEVEL_END: 'level_end', WIN: 'win' };
let gameState = STATE.MENU;

// Instead of: if (gameRunning && !gamePaused && !levelEnding)
// Use:        if (gameState === STATE.PLAYING)
```

This eliminates impossible state combinations and makes the code easier to reason about.

### 4. Use object-oriented design for game entities

The cat and mouse are currently tracked with separate variables (`catX`, `catY`, `mouseX`, `mouseY`). As you add more entities (multiple mice, obstacles, power-ups), this won't scale. A simple class would help:

```javascript
class Entity {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.size = size;
  }
  update() {
    this.x = lerp(this.x, this.targetX, 0.25);
    this.y = lerp(this.y, this.targetY, 0.25);
  }
}
```

### 5. Add sound effects with the Web Audio API

The game is entirely silent, which makes it feel incomplete. Even simple sounds would dramatically improve the experience. The Web Audio API can synthesize sounds without any audio files:

```javascript
const audioCtx = new AudioContext();

function playBounce() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 600;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}
```

This creates a short "blip" sound entirely from code. You could add sounds for: catching the mouse, turning, level complete, and the mouse escaping.

---

## Conclusion

This game demonstrates that you can build a complete, polished, installable game using nothing but the web platform's built-in tools. No frameworks, no build steps, no dependencies.

The key takeaways:

- **Canvas 2D** is powerful enough for most 2D games
- **requestAnimationFrame** gives smooth 60fps rendering
- **Vanilla JavaScript** can handle complex game logic without a framework
- **PWA** turns any website into an installable app
- **Capacitor** bridges the gap to native app stores
- **Responsive CSS** makes one codebase work on every screen size

Start simple, add complexity gradually, and always test on real devices. Happy coding!
