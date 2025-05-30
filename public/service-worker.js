const CACHE_NAME = 'map-app-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/data/0.svg',
  '/data/1.svg',
  '/data/2.svg',
  '/data/3.svg',
  '/data/0.js',
  '/data/1.js',
  '/data/2.js',
  '/data/3.js',
  '/data/passages.js',
  '/favicon.ico',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэширование основных ресурсов');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => console.error('Ошибка кэширования:', err))
  );
});

self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы и chrome-extension
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Возвращаем кэш если есть
        if (cachedResponse) {
          return cachedResponse;
        }

        // Иначе делаем сетевой запрос
        return fetch(event.request)
          .then(response => {
            // Кэшируем только успешные ответы и статические ресурсы
            if (response.ok && 
                (event.request.url.includes('/static/') || 
                 event.request.url.includes('/data/'))) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return response;
          })
          .catch(() => {
            // Fallback для HTML-страниц
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            return new Response('Оффлайн-режим');
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  // Удаляем старые кэши
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Удаляем старый кэш:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});