# 🌟 Maze Adventure!

A colorful, kid-friendly maze-solving game for ages 5–15, built as a Progressive Web App (PWA) using vanilla HTML, CSS, and JavaScript — no frameworks or build tools required.

---

## 📁 Project Structure

```
MazeSolving/
├── index.html      # Entire game (HTML + CSS + JS, all inline)
├── manifest.json   # PWA manifest (name, icon, display mode)
├── sw.js           # Service worker (offline caching)
├── icon.svg        # App icon used for home screen install
└── .gitignore      # Excludes IntelliJ IDE files
```

---

## 🎮 How to Play

1. Choose a difficulty level — **🐣 Easy**, **🦊 Medium**, or **🐉 Hard**
2. **Click and drag** (or tap and drag on mobile) starting from the green **S** cell
3. Draw a path through the maze corridors to reach the gold **F** cell
4. You cannot draw through walls — only open corridors are passable
5. If you retrace over a cell you already visited, the path trims back to that point
6. If you lift your finger/mouse mid-way, click back on any cell already in your path to **continue from there**
7. Reach **F** to win — a celebration message and confetti appear!

---

## 🕹️ Controls

| Button | Action |
|---|---|
| 🐣 Easy | Generate a new 9×9 maze |
| 🦊 Medium | Generate a new 13×13 maze |
| 🐉 Hard | Generate a new 19×19 maze |
| 🎲 New Maze | Regenerate a fresh random maze at the current difficulty |
| 🧹 Clear | Erase your drawn path and start over (maze stays the same) |

---

## 🧩 Features

### Maze Generation
- Uses **recursive backtracking** (depth-first search) implemented iteratively to avoid call-stack limits
- Every maze is a **perfect maze** — exactly one solution path exists between any two cells, no loops, no isolated sections
- A new random maze is generated each time you change difficulty or press New Maze

### Path Drawing
- Draw by clicking/touching and dragging across the canvas
- The path follows maze corridors — wall collisions are silently ignored
- **Backtracking**: dragging back over a previously visited cell trims the path to that point
- **Continuation**: lifting and re-clicking on any cell already in the path resumes drawing from there (no need to restart from S)
- Win is detected the moment the path reaches the F cell

### Canvas & Rendering
- Built on an HTML5 `<canvas>` element
- Cell size is computed dynamically from `window.innerWidth` so the maze always fits the screen
- Re-renders on window resize
- Drawing order: background → path line → path fills → start/finish cells → labels → walls (walls always render on top so they remain crisp)

### Win Celebration
- Animated pop-in modal with a win message
- 160 colorful confetti particles with gravity, rotation, and fade-out over ~4 seconds
- "Play Again" button generates a new maze at the same difficulty

### Responsive & Touch-Friendly
- Works on desktop (mouse) and mobile/tablet (touch)
- `touchstart`, `touchmove`, `touchend` events with `passive: false` to prevent accidental page scroll while drawing
- Canvas scales to fit any screen width

---

## 📱 PWA — Install on Your Phone

The app is a fully installable Progressive Web App.

> **Note:** PWAs require HTTPS or localhost — opening via `file://` will not register the service worker.

### Run locally

```bash
cd MazeSolving
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

### Install on Android (Chrome)
1. Open the app URL in Chrome
2. Tap the **three-dot menu → "Add to Home screen"**
3. The app opens fullscreen with no browser chrome

### Install on iPhone/iPad (Safari)
1. Open the app URL in Safari
2. Tap the **Share button → "Add to Home Screen"**
3. The app opens in standalone mode

### Offline support
The service worker caches all local assets (`index.html`, `manifest.json`, `icon.svg`) on first load. The game works fully offline after that. Google Fonts are cached on first use and served from cache on subsequent visits.

---

## ⚙️ Technical Details

### Maze Algorithm — Recursive Backtracking (DFS)

```
1. Start at cell (0, 0), mark it visited, push to stack
2. While stack is not empty:
   a. Look at the top cell
   b. Find unvisited neighbours in a random order
   c. If a neighbour exists:
        - Remove the wall between current cell and neighbour
        - Mark neighbour visited, push to stack
   d. If no unvisited neighbours: pop the stack (backtrack)
```

This guarantees a perfect maze (fully connected, no cycles) with a single unique solution.

### Wall Data Model

Each cell stores four boolean flags:

```js
cell.walls = { top: true, right: true, bottom: true, left: true }
```

When two cells are connected, their shared wall is set to `false` in both cells. Path validity is checked by reading these flags directly.

### Service Worker — Cache Strategy

| Resource | Strategy |
|---|---|
| Local files (`index.html`, etc.) | Cache-first, populate on install |
| Google Fonts | Network-first, cache on success, fallback to cache |

Cache is versioned (`maze-adventure-v1`). Old caches are deleted on `activate`.

---

## 🎨 Design

| Element | Color |
|---|---|
| Background | Purple–indigo gradient (`#4f46e5` → `#7c3aed` → `#c026d3`) |
| Maze background | Soft lavender white (`#fdf6ff`) |
| Walls | Deep indigo (`#2d1f6e`) |
| Start cell | Green (`#4ade80`) |
| Finish cell | Gold (`#fbbf24`) |
| Player path | Sky blue (`rgba(49, 130, 206, 0.65)`) |
| Fonts | [Fredoka One](https://fonts.google.com/specimen/Fredoka+One) (headings), [Nunito](https://fonts.google.com/specimen/Nunito) (UI) |

---

## 🚀 Deployment

The app is a static site — deploy to any static host:

| Platform | Command / Steps |
|---|---|
| **GitHub Pages** | Push to `main`, enable Pages from repo Settings |
| **Netlify** | Drag the project folder onto [netlify.com/drop](https://app.netlify.com/drop) |
| **Vercel** | `npx vercel` in the project directory |

No build step needed — just serve the files as-is.
