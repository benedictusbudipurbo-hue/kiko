// =====================================================================
//  Service worker aplikasi KiKo (PWA)
//  - Syarat supaya Chrome bisa memasang KiKo sebagai aplikasi.
//  - Strategi JARINGAN DULU untuk file KiKo sendiri: index.html yang baru
//    di-upload ke GitHub langsung terpakai; cache hanya cadangan saat offline
//    (wajah tetap bisa tampil tanpa internet; AI & pelacakan wajah tentu tidak).
//  - Permintaan ke domain lain (MediaPipe di jsDelivr/Google, Worker AI) tidak
//    disentuh: tetap lewat jaringan biasa.
//  Naikkan VERSI kalau daftar FILE berubah.
// =====================================================================
const VERSI = 'kiko-v1';
const FILE = ['./', './index.html', './manifest.json', './ikon-192.png', './ikon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(semua => Promise.all(semua.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(jawab => {
        if (jawab.ok) {
          const salinan = jawab.clone();
          caches.open(VERSI).then(c => c.put(e.request, salinan));
        }
        return jawab;
      })
      // offline: ?nfc=1 dan query lain diabaikan supaya tetap menemukan index.html
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
