const CACHE_NAME = 'mgrs-calc-v5'; // ← 更新時はここを v3, v4 と変える
const urlsToCache = [
  './',
  './index.html',
  './icon.png',
  './manifest.json'
];

// インストール処理（新しいバージョンを検知したらすぐインストール）
self.addEventListener('install', event => {
  self.skipWaiting(); // ★ここが重要：待機せずにすぐ新バージョンを適用
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// アクティベート処理（古いキャッシュを削除してコントロールを奪う）
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // 古いキャッシュを削除
          }
        })
      );
    }).then(() => self.clients.claim()) // ★ここが重要：開いているページも即座に新バージョンに切り替え
  );
});

// 通信処理（ネットワークファーストで常に最新を狙いつつ、圏外ならキャッシュを使う）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
