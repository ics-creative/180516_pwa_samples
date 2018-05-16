const CACHE_NAME = 'my-site-cache-v2';
const urlsToCache = [
  '../assets/photo.jpg',
];

self.addEventListener('install', async (event) => {
  // インストール処理
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {

  console.log('step - 0', event.request);

  event.respondWith(
    caches.match(event.request)
      .then((response) => {

        console.log('step - 1', response);

        // キャッシュがあったのでレスポンスを返す
        if (response) {
          console.log('step - 1 - 1');
          console.table(response);
          return response;
        }

        console.log('step - 2', response);

        // 重要：リクエストを clone する。リクエストは Stream なので
        // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
        // 必要なので、リクエストは clone しないといけない
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            console.log('step - 3', response);

            // レスポンスが正しいかをチェック
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 重要：レスポンスを clone する。レスポンスは Stream で
            // ブラウザ用とキャッシュ用の2回必要。なので clone して
            // 2つの Stream があるようにする
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            console.log('step - 4', response);
            return response;
          }
        );
      })
  );
});


