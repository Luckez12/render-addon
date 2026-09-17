# render-addon

Multi-provider Stremio stream addon hosted on Render.

## Structure

```text
/
├── addon.js
├── providers/
│   ├── moviebox.js
│   └── kisskh.js
├── package.json
├── README.md
└── .gitignore
```

## Providers

- MovieBox
- KissKH

Providers are queried in parallel. If one provider fails, the other provider can still return streams.

Known fixed qualities below 720p are filtered out globally. Adaptive/unknown (`Auto`) streams are retained for now and can be tuned after all providers are added.

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
