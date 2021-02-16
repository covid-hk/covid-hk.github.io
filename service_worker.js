/**
 * https://codelabs.developers.google.com/codelabs/add-to-home-screen/index.html
 * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer
 * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API/Using_Service_Workers
 * https://developers.google.com/web/fundamentals/app-install-banners
 * https://developers.google.com/web/fundamentals/primers/service-workers
 * https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
 * https://developers.google.com/web/fundamentals/primers/service-workers/registration
 * https://developers.google.com/web/updates/2018/06/a2hs-updates
 * https://github.com/NekR/self-destroying-sw
 * https://github.com/w3c/ServiceWorker/issues/614
 * https://love2dev.com/blog/how-to-uninstall-a-service-worker/
 * https://pjchender.github.io/2018/03/05/pwa-服務工作線程（service-workers）/
 * https://stackoverflow.com/questions/38826397/add-to-home-screen-functionality-using-javascript
 * https://stackoverflow.com/questions/46424367/how-to-unregister-and-remove-old-service-worker
 * https://w3c.github.io/ServiceWorker/#navigator-service-worker-getRegistrations
 * https://www.w3.org/TR/service-workers/
**/

var unixtimestamp = Math.floor(Date.now() / 1000);
var unixtimestampper15mins = Math.floor(unixtimestamp / 1000);
var CACHE_NAME = 'covid-cache-v216-' + unixtimestampper15mins;
var urlsToCache = [
  '/',
  '/index.html?t=' + unixtimestamp,
  '/building_list.css?t=' + unixtimestamp,
  '/ajax_controller.js?t=' + unixtimestamp,
  '/building_list.js?t=' + unixtimestamp,
  '/cases_chart.js?t=' + unixtimestamp,
  '/enhanced_sur.js?t=' + unixtimestamp,
  '/geolocation.js?t=' + unixtimestamp,
  '/googlemap.js?t=' + unixtimestamp,
  '/covid_icon128.png?t=' + unixtimestamp,
  '/covid_icon192.png?t=' + unixtimestamp,
  '/covid_icon512.png?t=' + unixtimestamp
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        //console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
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
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME, 'covid-pages-cache-v1', 'covid-blog-posts-cache-v1'];

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
});
