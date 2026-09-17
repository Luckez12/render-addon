# render-addon

Simple Stremio addon intended to run on Render.

## Local run

```bash
npm install
npm start
```

Manifest:

```text
http://127.0.0.1:7000/manifest.json
```

## Render

Use:

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`

After deployment, install the addon in Stremio using:

```text
https://YOUR-SERVICE.onrender.com/manifest.json
```

## Test item

The sample stream handler returns Big Buck Bunny for IMDb ID:

```text
tt1254207
```
