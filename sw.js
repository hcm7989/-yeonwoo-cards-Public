/* Ellie English — 서비스 워커
   앱 껍데기를 저장해 두어서 비행기 모드에서도 열리게 합니다.

   전략:
     · 앱 코드(html/js/manifest) → 네트워크 먼저, 안 되면 저장된 사본.
       고친 파일이 바로 반영됩니다. 예전처럼 옛 파일을 붙들고 있지 않습니다.
     · 아이콘 → 저장된 사본 먼저 (바뀔 일이 없으니 빠른 쪽으로).

   앱을 고친 뒤에는 아래 CACHE 뒤의 숫자를 하나 올리세요. */

const CACHE = "ellie-english-v9";

const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./seed.js",
  "./firebase-config.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-64.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      // cache:"reload" — 설치할 때만은 브라우저 캐시를 건너뛰고 원본을 받아 옵니다
      .then(c => Promise.allSettled(SHELL.map(u => c.add(new Request(u, { cache: "reload" })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function putIfOk(req, res){
  if(res && res.status === 200 && res.type === "basic"){
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
  }
  return res;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;

  const url = new URL(req.url);
  // 같은 주소의 파일만 다룹니다. 구글 폰트나 Firebase 요청은 건드리지 않습니다.
  if(url.origin !== self.location.origin) return;

  // 아이콘: 저장된 사본 먼저
  if(url.pathname.includes("/icons/")){
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => putIfOk(req, res)))
    );
    return;
  }

  // 화면 이동: 네트워크 먼저, 안 되면 저장해 둔 index.html
  if(req.mode === "navigate"){
    e.respondWith(
      fetch(req)
        .then(res => {
          if(res && res.status === 200 && res.type === "basic"){
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put("./index.html", copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html").then(r => r || caches.match("./")))
    );
    return;
  }

  // 앱 코드: 네트워크 먼저, 안 되면 저장된 사본
  e.respondWith(
    fetch(req)
      .then(res => putIfOk(req, res))
      .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
  );
});
