// Фоновый помощник PWA «Морковь Фрут · БАР» (2026-10-26). Собирается tools/build_pwa.js: 202610252347-1260615a — версия сборки.
// Приложение (страница, иконки, Vue) хранится в телефоне: открывается сразу, без загрузки 3 МБ. Запросы к серверу
// (script.google.com) идут мимо — данные всегда свежие. Новая сборка = новый sw.js: браузер ставит его рядом со старым,
// страница показывает «Обновить» (pwa.js), по нажатию — skipWaiting и перезагрузка.
const VERSION = '__VERSION__';
const CACHE = 'mf-bar-' + VERSION;
const VUE = 'https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.prod.js';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.ico', './icons/favicon.svg', VUE];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('mf-bar-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin && req.url !== VUE) return;   // сервер приложения и прочее — без помощника
  // Открытие приложения (любой адрес внутри) — страница из хранилища; нет в нём — из сети
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
