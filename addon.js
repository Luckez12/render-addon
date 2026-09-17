const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
  id: "com.luckez12.renderaddon",
  version: "1.0.0",
  name: "Luckez Stremio Addon",
  description: "Custom Stremio addon hosted on Render",
  resources: ["stream"],
  types: ["movie", "series"],
  catalogs: [],
  idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id }) => {
  console.log(`[STREAM] type=${type} id=${id}`);

  // Public test stream: Big Buck Bunny
  if (type === "movie" && id === "tt1254207") {
    return {
      streams: [
        {
          name: "Luckez Addon",
          title: "Big Buck Bunny • Test Stream",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }
      ]
    };
  }

  return { streams: [] };
});

const PORT = Number(process.env.PORT || 7000);

serveHTTP(builder.getInterface(), {
  port: PORT
});

console.log(`Stremio addon running on port ${PORT}`);
