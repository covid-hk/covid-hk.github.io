/**
 * https://codelabs.developers.google.com/codelabs/add-to-home-screen/index.html
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen
 * https://stackoverflow.com/questions/38826397/add-to-home-screen-functionality-using-javascript
 * https://pjchender.github.io/2018/03/05/pwa-服務工作線程（service-workers）/
**/

/**
 * https://w3c.github.io/ServiceWorker/#navigator-service-worker-getRegistrations
 * https://www.w3.org/TR/service-workers/
 * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer
**/

/**
 * https://love2dev.com/blog/how-to-uninstall-a-service-worker/
 * https://github.com/NekR/self-destroying-sw
 * https://github.com/w3c/ServiceWorker/issues/614
**/

/**
 * https://developers.google.com/web/fundamentals/primers/service-workers
 * https://developers.google.com/web/fundamentals/app-install-banners
 * https://developers.google.com/web/updates/2018/06/a2hs-updates
**/

var CACHE_NAME = 'covid-cache-v1';
var urlsToCache = [
  '/'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  /*
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  */
});

self.addEventListener('fetch', function(event) {
  /*
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
  */
});

self.addEventListener('activate', function(event) {
  self.registration.unregister()
  .then(function() {
    return self.clients.matchAll();
  })
  .then(function(clients) {
    clients.forEach(client => client.navigate(client.url))
  });
  /*
  var cacheWhitelist = ['covid-cache-v98', 'covid-cache-v99'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  */
});
