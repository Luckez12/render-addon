# render-addon

Stremio stream addon for Render.

## Structure

```text
/
├── addon.js
├── providers/
│   └── moviebox.js
├── package.json
├── README.md
└── .gitignore
```

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

Movie request:

```text
/stream/movie/tt1234567.json
```

Series request:

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
