# Matcha Zen · The Ritual of Cha

Pre-launch website for **Matcha Zen**, a NOMIX Hospitality brand opening December 10, 2026 in Houston, TX.
Drinks · Gelato · Gelato Cakes · Bakery. 100% organic matcha.

Static site (HTML/CSS/JS, no build step) hosted on GitHub Pages. English, 中文 and Español.

## Editing
- **Opening date:** `OPEN_DATE` at the top of `js/main.js`.
- **Text / translations:** English is in `index.html`; Chinese and Spanish are in `js/i18n.js` (same keys).
  Link straight to a language with `?lang=zh` or `?lang=es`.
- **Brand palette:** top of `css/style.css` (from the brand deck's Visual Identity page).
- **Photos:** `assets/img/`.

## "Tagged by you" carousel
Posts listed in `data/tagged.json` are shown first in the carousel with the poster's handle:

```json
{ "posts": [ { "image": "https://...jpg", "user": "@handle", "url": "https://www.instagram.com/p/..." } ] }
```

Only `https://` images and links are accepted. To fill it automatically from Instagram, the
@matchazenhouse account must be an Instagram Business/Creator account; then either
- point `TAGGED_FEED_URL` in `js/main.js` at a JSON feed from a UGC/hashtag widget service, or
- run a small scheduled job (e.g. GitHub Actions) that calls the Instagram Graph API
  `/{ig-user-id}/tags` endpoint and writes `data/tagged.json`.
Instagram only returns tagged posts from public accounts.
