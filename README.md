# HYROX // Redemption Cycle

A personal training + nutrition + recovery dashboard for Andrea's 7-week HYROX
build, Sep 8 – Nov 1, 2026. Every workout, meal, quantity and equivalent
comes directly from the two source PDFs — nothing invented, nothing shortened.

## Run it locally

No build step. Just serve the folder over HTTP (opening `index.html` directly
via `file://` will block the service worker and localStorage in some
browsers):

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish on GitHub Pages

1. Create a new GitHub repository and push all these files to its root
   (`index.html`, `styles.css`, `app.js`, `data.js`, `manifest.json`,
   `service-worker.js`, `icons/`).
2. In the repo, go to **Settings → Pages**, set **Source** to your default
   branch and root folder, and save.
3. GitHub gives you a URL like `https://<username>.github.io/<repo>/`. Open
   it on your iPhone in Safari.

## Add to iPhone Home Screen

1. Open the GitHub Pages URL in Safari.
2. Tap the Share icon → **Add to Home Screen**.
3. It launches full-screen, works offline after the first load, and keeps
   its own icon and title ("Redemption").

## Data & privacy

Everything you log — sleep, water, meals, training, check-ins — is stored
only in your browser's `localStorage` on your device. Nothing is sent
anywhere. Use **Progress → Export Data** any time to save a JSON backup, and
**Import Data** to restore it (e.g. after clearing Safari data or switching
phones).

## Updating the plan later

All training and nutrition content lives in `data.js`, keyed by date
(`TRAINING` and `NUTRITION` objects). Edit that file and re-publish to
adjust any day without touching the app logic.
