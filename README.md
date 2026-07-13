# jin-site

A single-page personal site — plain HTML/CSS/JS, no build step, no
dependencies beyond Google Fonts. Command palette (⌘K), 3D tilt cards, and
an animated background, all dependency-free.

## Host it on GitHub Pages

1. Create a repo named exactly `Avishkaar007.github.io`.
2. Push these files to `main`:
   ```bash
   cd jin-site
   git init
   git add .
   git commit -m "personal site"
   git branch -M main
   git remote add origin https://github.com/Avishkaar007/Avishkaar007.github.io.git
   git push -u origin main
   ```
3. Settings → Pages should already point at `main` / root for this repo
   name. Give it ~1 minute, then visit `https://Avishkaar007.github.io`.

## Add your profile photo

Drop an image at `assets/avatar.jpg` (square, at least 256×256 works well —
it gets cropped to a circle). If the file's missing, the site quietly falls
back to a big "J" initial, so nothing breaks either way.

## Add project cards

Each section (`#extensions`, `#android`, `#webapps`) in `index.html` has a
dashed "next up" placeholder card — duplicate the real card markup above it
(`<article class="card card-signal tilt reveal">...`) for each new project,
using `card-signal` / `card-wire` / `card-pulse` to vary the accent color.

## Articles

`content/articles.json` drives the Articles section. It's currently an
empty array — add entries like:
```json
[
  { "id": "grub-repair", "title": "How I fixed a dead GRUB install", "date": "2026-07", "body": "Article text goes here." }
]
```
Each article is stored directly in this tracked JSON file. The homepage opens
the article text in place, so there are no generated article HTML files to
manage.

## Theme switcher

A sun/moon button sits in the nav next to the command-palette button.
Toggling it flips `data-theme` between `dark` (default) and `light` on
`<html>`, and remembers the choice in `localStorage` (`jin-theme`) — a small
inline script in `<head>` applies it before paint so there's no flash.
The light theme uses a true white background and higher-contrast text tokens.

## Command palette, now in the nav

The palette itself is unchanged (`⌘K` / `Ctrl+K`, fuzzy list, arrow keys),
but the trigger button moved from a floating pill in the corner into the
nav bar, so nothing sits on top of the page until you actually open it.

## Rajasthani touches

`style.css` gained a few small, reusable motifs — a bandhani dot-field
(`.texture-bandhani`), jali corner lines (`.motif-corner`), and a diamond
mark on section eyebrows — all tinted from the existing signal/pulse/wire
palette rather than a bolt-on skin.

## About the "creator / upload" area

You asked for a private space to write articles and upload files/software
that only you can access. Worth being direct about what's actually possible
on GitHub Pages, since it's 100% static hosting — no server, no database,
no real login system can run there. A password typed into public JS isn't
real security; anyone can read the page source.

What's built, given that constraint:

- **`editor.html`** — create, edit, and delete article objects in
  `content/articles.json`. It exports the complete tracked JSON file; replace
  the file in the repo, then commit and push to publish.

- **`edit.html`** — create, edit, and delete project-card objects in
  `content/sites.json`, exporting that same tracked file for commit and push.

- Both pages are **not linked from the nav**, are marked `noindex`, and sit
  behind a passphrase prompt (hashed into `localStorage` on first use, key
  shared between the two pages). Be clear-eyed about what that is: a
  speed bump for casual visitors, not real authentication — anyone who
  reads the page source or opens dev tools can get past it. On 100%
  static hosting, the URL itself is the actual secret. If you ever want
  real per-user auth and server-saved publishing, that means a backend
  (Cloudflare Workers + R2, Supabase, etc.) — a different, bigger project
  than a GitHub Pages site, and one I'm happy to help scope whenever you
  want it.

## Design notes

- Palette + fonts: same token system as before — five CSS variables at the
  top of `style.css` (`--ink`, `--panel`, `--signal`, `--pulse`, `--wire`)
  and three font families loaded from Google Fonts.
- Command palette: `⌘K` / `Ctrl+K`, or the floating button bottom-right.
  Commands live in the `COMMANDS` array near the top of the palette section
  in `script.js` — add more by pushing objects with `label`, `hint`, and
  `action`.
- 3D tilt: cards with the `tilt` class rotate toward the cursor on
  mousemove, pure CSS transforms, no library.
- Background: a few soft blurred color blobs drifting on a `<canvas>`,
  matching the accent palette.
- Everything respects `prefers-reduced-motion` — animations fall back to
  static/instant states.
