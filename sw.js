const CACHE_NAME = 'mgrs-calc-v24'; // ★ここを更新のたびに v3, v4 と変えます
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png' // ※アイコンのファイル名に合わせてください
];

// インストール時にキャッシュを保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

// ★キャッシュ優先＆裏側で通信（Stale-While-Revalidate法）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // ネットワークへのリクエストも同時に行う（裏側で）
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // 通信成功したら、最新のデータをこっそりキャッシュに上書き
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // 通信失敗（圏外や微弱）の場合は何もしない
      });

      // 1. キャッシュがあれば【即座に】それを返す（爆速起動）
      // 2. キャッシュがまだ無い初回のみ、ネットワークの完了を待つ
      return cachedResponse || fetchPromise;
    })
  );
});
