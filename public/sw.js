// Racha · el que recibe los avisos (service worker).
// Solo hace dos cosas: mostrar el aviso que llega y abrir Racha en el lugar correcto al tocarlo.
// A propósito NO guarda nada en caché ni intercepta la red: así nadie se queda pegado en una versión vieja.

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

const DESTINOS = ['hoy', 'dificil', 'compromisos', 'foco'];

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = {}; }
  const titulo = typeof d.titulo === 'string' && d.titulo ? d.titulo : 'Racha';
  const opciones = {
    body: typeof d.cuerpo === 'string' ? d.cuerpo : '',
    icon: '/icon-192.png',
    badge: '/badge-96.png',
    lang: 'es',
    data: { destino: DESTINOS.indexOf(d.destino) >= 0 ? d.destino : 'hoy' },
  };
  if (typeof d.etiqueta === 'string' && d.etiqueta) { opciones.tag = d.etiqueta; opciones.renotify = true; }
  // Siempre se muestra: el iPhone quita el permiso si llega un aviso y no se muestra nada.
  e.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const destino = (e.notification.data && e.notification.data.destino) || 'hoy';
  e.waitUntil((async () => {
    const todas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const abierta = todas.find((c) => { try { return new URL(c.url).pathname.indexOf('/panel') !== 0; } catch (_) { return false; } });
    if (abierta) {
      try {
        const w = await abierta.focus();
        (w || abierta).postMessage({ racha: 'abrir', destino });
        return;
      } catch (_) { /* en iPhone a veces no deja enfocar: se abre de nuevo */ }
    }
    await self.clients.openWindow('/?abrir=' + destino);
  })());
});
