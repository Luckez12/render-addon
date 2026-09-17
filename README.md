# render-addon

Stremio stream addon for Render.

## Files

- `addon.js` — Stremio addon server and IMDb/series request handling
- `moviebox.js` — provider module
- `package.json` — Node dependencies and scripts

## Local

```bash
npm install
npm run check
npm start
```

Manifest:

```text
http://127.0.0.1:7000/manifest.json
```

Movie stream request format:

```text
/stream/movie/tt1234567.json
```

Series stream request format:

```text
/stream/series/tt1234567:1:1.json
```

## Render

Build command:

```text
npm install
```

Start command:

```text
npm start
```

Install URL:

```text
https://render-addon.onrender.com/manifest.json
```
