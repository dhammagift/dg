// service-worker.js

const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;

// Define paths to cache on install
const CACHE_PATHS = [
  // Root files
  "./",
  "./index.html",
  "./manifest.json",

  // Asset directories
  "./assets/**/*",
  "./fonts/**/*",
  "./icons/**/*",
  "./images/**/*",
  "./models/**/*",
  "./audio/**/*",
];

// Helper function to check if a URL matches our cache patterns
function shouldCache(urlString) {
  let pathname;

  try {
    // If it's an absolute URL
    const url = new URL(urlString);
    pathname = url.pathname;
  } catch {
    // If it's a relative URL
    pathname = urlString;
  }

  // Cache root files (files with extension in root directory)
  if (pathname.match(/^\/[^/]+\.[^/]+$/)) {
    return true;
  }

  // Cache files from specific directories
  const cacheDirs = [
    "./assets/",
    "./fonts/",
    "./icons/",
    "./images/",
    "./models/",
    "./audio/",
  ];

  return cacheDirs.some((dir) => pathname.startsWith(dir));
}

// Helper function to expand wildcard patterns
async function getFilesToCache() {
  const filesSet = new Set();

  // First, add the root files
  filesSet.add("./");
  filesSet.add("./index.html");
  filesSet.add("./manifest.json");

  try {
    // Get the list of all files in the directories we want to cache
    const response = await fetch("./asset-manifest.json");
    if (response.ok) {
      const manifest = await response.json();
      Object.values(manifest).forEach((path) => {
        if (shouldCache(path)) {
          filesSet.add(path);
        }
      });
    }
  } catch (error) {
    console.warn(
      "Could not load asset manifest, falling back to runtime caching",
    );
  }

  return Array.from(filesSet);
}

// Install event handler
self.addEventListener("install", (event) => {
  event.waitUntil(
    getFilesToCache()
      .then((filesToCache) =>
        caches.open(CACHE_NAME).then((cache) => cache.addAll(filesToCache)),
      )
      .then(() => self.skipWaiting()),
  );
});

// Activate event handler
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event handler
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // Only cache same-origin requests that match our patterns
        const url = new URL(event.request.url);
        if (url.origin === self.location.origin && shouldCache(url.pathname)) {
          const responseToCache = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.error("Cache put error:", error);
            });
        }

        return response;
      });
    }),
  );
});
