/* 연우 말 카드 — 서비스 워커
   앱 껍데기를 캐시해서 비행기 모드에서도 열리게 합니다.
   앱을 고친 뒤에는 아래 CACHE 뒤의 숫자를 하나 올리세요. */

const CACHE = "yeonwoo-cards-v4";

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
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
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

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;

  const url = new URL(req.url);
  // 같은 주소의 파일만 다룹니다. 구글 폰트나 Firebase 요청은 건드리지 않습니다.
  if(url.origin !== self.location.origin) return;

  // 화면 이동은 네트워크 먼저, 안 되면 캐시된 index.html
  if(req.mode === "navigate"){
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html").then(r => r || caches.match("./")))
    );
    return;
  }

  // 나머지 파일은 캐시 먼저, 뒤에서 조용히 새로 받아 둡니다
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if(res && res.status === 200 && res.type === "basic"){
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
