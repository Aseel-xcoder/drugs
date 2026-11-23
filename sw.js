/* الدليل اليمني الشامل للأدوية — service worker للتثبيت والعمل دون اتصال.
   يخبّئ الواجهة والبيانات الأساسية عند أول زيارة؛ ملفات الجولة الثانية
   تُخبَّأ عند أول استخدام لها. */
const CACHE = 'aseel-drugs-v3';
const CORE = [
  './', 'index.html', 'style.css', 'app.js',
  'icon-192.png', 'icon-512.png',
  'data/scientific.json', 'data/drugs_1.json', 'data/drugs_2.json',
  'data/drugs_3.json', 'data/drugs_4.json', 'data/proxy.json',
  'data/company.json', 'data/classes.json', 'data/class_links.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // ملف التثبيت (manifest) يُجلب من الشبكة دائماً — لا يُخبَّأ أبداً،
  // حتى لا يبقى كروم على هوية تثبيت قديمة.
  if (new URL(e.request.url).pathname.endsWith('/manifest.json')) {
    e.respondWith(fetch(e.request).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('index.html'));
    })
  );
});
