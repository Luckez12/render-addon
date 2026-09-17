const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const moviebox = require("./providers/moviebox");
const kisskh = require("./providers/kisskh");

const manifest = {
  id: "com.luckez12.renderaddon",
  version: "1.3.0",
  name: "Luckez Stremio Addon",
  description: "Custom multi-provider Stremio stream addon hosted on Render",
  resources: ["stream"],
  types: ["movie", "series"],
  catalogs: [],
  idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

const PROVIDERS = [
  {
    id: "moviebox",
    name: "MovieBox",
    getStreams: moviebox.getStreams
  },
  {
    id: "kisskh",
    name: "KissKH",
    getStreams: kisskh.getStreams
  }
];

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

function qualityNumber(value) {
  const text = String(value || "").toLowerCase();

  if (text.includes("4k")) return 2160;
  if (text.includes("2k")) return 1440;

  const match = text.match(/(\d{3,4})\s*p?/);
  return match ? Number(match[1]) : 0;
}

function isAllowedQuality(stream) {
  const quality = qualityNumber(stream && stream.quality);

  // Enforce the user's >=720p rule when the provider exposes a known quality.
  // "Auto" / unknown quality is kept for now because adaptive HLS sources often
  // do not expose a fixed resolution in the URL.
  return !quality || quality >= 720;
}

function normalizeStream(stream, requestInfo, provider) {
  if (!stream || !stream.url) return null;
  if (!isAllowedQuality(stream)) return null;

  const out = {
    name: stream.name || provider.name,
    title: stream.title || stream.quality || provider.name,
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
      "luckez-" + provider.id + "-" + (quality || "auto");
  }

  if (Object.keys(behaviorHints).length) {
    out.behaviorHints = behaviorHints;
  }

  return out;
}

function dedupeStreams(streams) {
  const seen = new Set();

  return (streams || []).filter((stream) => {
    if (!stream || !stream.url) return false;

    // Signed query strings may differ while pointing to the same media URL.
    // For now keep the full URL to avoid accidentally merging distinct streams.
    const key = String(stream.url);
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

async function resolveProvider(provider, tmdbId, info) {
  const startedAt = Date.now();

  try {
    const raw = await provider.getStreams(
      tmdbId,
      info.mediaType,
      info.season,
      info.episode
    );

    const streams = (raw || [])
      .map((stream) => normalizeStream(stream, info, provider))
      .filter(Boolean);

    console.log(
      `[${provider.name}] addon streams=${streams.length} elapsed=${Date.now() - startedAt}ms`
    );

    return streams;
  } catch (error) {
    console.error(
      `[${provider.name}] provider error:`,
      error && error.message ? error.message : error
    );
    return [];
  }
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
    const tmdbId = await moviebox.getTmdbIdFromImdb(
      info.imdbId,
      info.mediaType
    );

    if (!tmdbId) {
      console.log(`[STREAM] IMDb -> TMDB mapping not found for ${info.imdbId}`);
      return { streams: [] };
    }

    console.log(`[STREAM] IMDb=${info.imdbId} -> TMDB=${tmdbId}`);

    // Providers run in parallel. A slow/failed provider does not prevent
    // another provider from returning its streams.
    const groups = await Promise.all(
      PROVIDERS.map((provider) => resolveProvider(provider, tmdbId, info))
    );

    const streams = dedupeStreams(groups.flat());

    console.log(
      `[STREAM] providers=${PROVIDERS.length} returned=${streams.length}`
    );

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
