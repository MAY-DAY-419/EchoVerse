# EchoVerse

Progressive Web App setup
- Add to Home Screen on Android/iOS
- Standalone fullscreen after install
- Offline support with a service worker and offline fallback page

Replace icons and branding
- Place your app icons in `assets/` and update `manifest.json` if you change names.
- For best results provide PNG icons:
	- 192x192: `assets/icon-192.png`
	- 512x512: `assets/icon-512.png`
	- Optional maskable: `assets/icon-512-maskable.png`
- iOS home screen icon uses a PNG ~180x180 via `<link rel="apple-touch-icon" ...>`.

Files involved
- `manifest.json` – PWA metadata (name, colors, icons, start_url, shortcuts)
- `sw.js` – Service worker with precache + offline fallback
- `offline.html` – Shown when offline navigation fails
- `assets/sample.svg` – Temporary icon (replace with your own PNGs)

Local testing tips
- Use Chrome/Edge dev tools > Application > Manifest to verify PWA installability
- On iOS Safari use Share > Add to Home Screen

Vercel
- Static deploy from repo root. `vercel.json` routes `/` to `index.html`.