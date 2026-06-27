# Nyan Cat 🌈🐱

A complete, looping Nyan Cat animation starring **my own cat** — flying through
a scrolling starfield, trailing a waving rainbow, riding a frosted pop-tart,
all in time to an original 8-bit chiptune.

Pure HTML/CSS/JS on a single `<canvas>`. No build step, no dependencies.

## Run locally

It's fully static — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

Tap **Start** (browsers require a user gesture before audio can play).

## Deploy on Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** this repo.
3. Framework preset: **Other**. No build command, output dir = root.
4. Deploy. You'll get a URL you can open on any device.

## Notes

- The cat photo's white background is chroma-keyed to transparent in-canvas,
  so the cat floats in space.
- The music is an **original** chiptune loop synthesized with the Web Audio
  API — not the copyrighted Nyan Cat song.
- Everything scales responsively and works on phones (tap to start, 🔊 to mute).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell + start overlay |
| `style.css` | Layout & overlay styling |
| `app.js` | Canvas animation + Web Audio chiptune |
| `cat.jpg` | The star of the show |
