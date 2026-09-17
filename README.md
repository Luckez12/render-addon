# render-addon

Multi-provider Stremio stream addon hosted on Render.

## Providers

- MovieBox
- OneTouchTV

Both providers are queried together and their usable streams are combined.

## Quality policy

Minimum known quality: 720p.

- 2160p / 4K: allowed
- 1440p: allowed
- 1080p: allowed
- 720p: allowed
- 480p: blocked
- 360p: blocked
- OneTouchTV `Auto` / unknown quality: allowed
- OneTouchTV explicit 360p / 480p: blocked

MovieBox retains its existing min-720 filtering behavior.

## Structure

```text
/
├── addon.js
├── providers/
│   ├── moviebox.js
│   └── onetouchtv.js
├── package.json
├── README.md
└── .gitignore
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
