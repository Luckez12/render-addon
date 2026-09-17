const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const { getStreamsByImdb } = require("./providers/moviebox");

const manifest = {
  id: "com.luckez12.renderaddon",
  version: "1.2.0",
  name: "Luckez Stremio Addon",
  description: "Custom Stremio stream addon hosted on Render",
  resources: ["stream"],
  types: ["movie", "series"],
  catalogs: [],
  idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

function parseStremioId(type, id) {
  const parts = String(id || "").split(":");
  const imdbId = parts[0];

  if (!/^tt\d+$/i.test(imdbId)) return null;

  if (type === "series") {
    const season = Number(parts[1] || 1);
    const episode = Number(parts[2] || 1);

    if (!Number.isFinite(season) || season < 1) return null;
    if (!Number.isFinite(episode) || episode < 1) return null;

    return {
      imdbId,
      mediaType: "tv",
      season,
      episode
    };
  }

  if (type === "movie") {
    return {
      imdbId,
      mediaType: "movie",
      season: 0,
      episode: 0
    };
  }

  return null;
}

function normalizeStream(stream, requestInfo) {
  if (!stream || !stream.url) return null;

  const out = {
    name: stream.name || "MovieBox",
    title: stream.title || stream.quality || "MovieBox",
    url: String(stream.url)
  };

  const behaviorHints = Object.assign({}, stream.behaviorHints || {});
  const headers = stream.headers && typeof stream.headers === "object"
    ? stream.headers
    : null;

  if (headers && Object.keys(headers).length) {
    behaviorHints.notWebReady = true;
    behaviorHints.proxyHeaders = Object.assign(
      {},
      behaviorHints.proxyHeaders || {},
      {
        request: Object.assign(
          {},
          (behaviorHints.proxyHeaders && behaviorHints.proxyHeaders.request) || {},
          headers
        )
      }
    );
  }

  if (!/\.mp4(?:$|\?)/i.test(out.url)) {
    behaviorHints.notWebReady = true;
  }

  const quality = String(stream.quality || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  if (requestInfo && requestInfo.mediaType === "tv") {
    behaviorHints.bingeGroup =
      "luckez-moviebox-" + (quality || "auto");
  }

  if (Object.keys(behaviorHints).length) {
    out.behaviorHints = behaviorHints;
  }

  return out;
}

builder.defineStreamHandler(async ({ type, id }) => {
  const info = parseStremioId(type, id);

  if (!info) {
    console.log(`[STREAM] unsupported type/id type=${type} id=${id}`);
    return { streams: [] };
  }

  console.log(
    `[STREAM] type=${type} id=${id} imdb=${info.imdbId}` +
    (info.mediaType === "tv" ? ` S${info.season}E${info.episode}` : "")
  );

  try {
    const rawStreams = await getStreamsByImdb(
      info.imdbId,
      info.mediaType,
      info.season,
      info.episode
    );

    const streams = (rawStreams || [])
      .map((stream) => normalizeStream(stream, info))
      .filter(Boolean);

    console.log(`[STREAM] returned=${streams.length}`);
    return { streams };
  } catch (error) {
    console.error(
      "[STREAM] error:",
      error && error.stack ? error.stack : error
    );
    return { streams: [] };
  }
});

const PORT = Number(process.env.PORT || 7000);

serveHTTP(builder.getInterface(), {
  port: PORT
});

console.log(`Stremio addon running on port ${PORT}`);
