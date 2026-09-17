# render-addon

Multi-provider Stremio stream addon hosted on Render.

## Providers

- MovieBox
- OneTouchTV
- 4KHDHub
- KissKH

All providers are queried together and their usable streams are combined.

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
- 4KHDHub 4K / 1080p / 720p: allowed
- 4KHDHub Auto / unknown quality: allowed
- 4KHDHub explicit 360p / 480p: blocked
- KissKH 720p / 1080p / 4K: allowed
- KissKH Auto / unknown quality: allowed
- KissKH explicit 360p / 480p: blocked

MovieBox retains its existing min-720 filtering behavior.

## Structure

```text
/
├── addon.js
├── providers/
│   ├── moviebox.js
│   ├── onetouchtv.js
│   ├── 4khdhub.js
│   └── kisskh.js
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
