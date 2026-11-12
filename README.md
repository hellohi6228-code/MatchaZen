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

## "Tagged by you" carousel (auto-synced from Instagram)
A GitHub Action (`.github/workflows/sync-tagged.yml`) runs every 3 hours. It asks Instagram for
public posts that tag @matchazenhouse, downloads the photos into `assets/tagged/`, writes
`data/tagged.json`, and redeploys the site. New tagged posts show up first in the carousel with the
poster's @handle, linking to their post.

**Hide a post or account:** add its post ID or @handle to `data/tagged-blocklist.json`:
```json
{ "ids": ["17890000000000000"], "users": ["@someone"] }
```
The next sync removes it (or run the workflow manually from the Actions tab).

### One-time setup (needs the @matchazenhouse login)
1. In the Instagram app, switch @matchazenhouse to a **Business** (or Creator) account and connect it to a Facebook Page.
2. At developers.facebook.com create an app (type **Business**) and add the Instagram product ("Instagram API with Facebook Login").
3. In the Graph API Explorer, select the app, then generate a **User** token with these permissions:
   `instagram_basic`, `instagram_manage_comments`, `pages_read_engagement`, `pages_show_list`.
4. Exchange it for a long-lived token (Access Token Debugger → "Extend Access Token").
5. Find the Instagram account ID: in the Explorer, run `me/accounts` to get the Page ID, then
   `{page-id}?fields=instagram_business_account`. The `id` inside is your **IG_USER_ID**.
6. In this repo: Settings → Secrets and variables → Actions → New repository secret. Add
   `IG_USER_ID` and `IG_ACCESS_TOKEN`.
7. Actions tab → "Sync tagged Instagram posts" → **Run workflow**.

Long-lived user tokens last about 60 days. When it expires, the workflow run fails and GitHub emails
you; generate a new one (steps 3–4) and update the `IG_ACCESS_TOKEN` secret.
