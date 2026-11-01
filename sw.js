// © 2026 Mec Produções. Todos os direitos reservados.
const V = 'velha-v2';
const ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Arquivos do proprio jogo e a biblioteca PeerJS: serve do cache e atualiza em segundo plano.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin && u.hostname !== 'unpkg.com') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const rede = fetch(e.request).then(r => {
        if (r && (r.status === 200 || r.type === 'opaque')) {
          const copia = r.clone();
          caches.open(V).then(c => c.put(e.request, copia));
        }
        return r;
      }).catch(() => hit);
      return hit || rede;
    })
  );
});
