# Nyan Cat 🌈🐱

A complete, looping recreation of the classic **Nyan Cat** animation — frosted
pop-tart body, galloping legs, a waving striped tail, the stepped rainbow that
wags between two frames, a twinkling scrolling starfield, and deep-blue space —
but the cat is redrawn as **my own brown tabby** (green eyes, "M" forehead
markings, pink nose, cream muzzle) instead of the gray original.

Everything is hand-drawn pixel art on a single `<canvas>`. Pure HTML/CSS/JS,
no build step, no dependencies.

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

- The cat is procedural pixel art (see the `HEAD` / `POPTART` sprite grids and
  the tail/leg drawing code in `app.js`) — no image assets needed.
- The music is `song.mp3`, looped seamlessly.
- Everything scales responsively and works on phones (tap to start, 🔊 to mute).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell + start overlay |
| `style.css` | Layout & overlay styling |
| `app.js` | Pixel-art animation + looping soundtrack |
| `song.mp3` | The soundtrack |
