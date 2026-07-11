// Service worker minimal : réception des notifications push + clic pour ouvrir l'app.
// Pas de mise en cache offline ici — le rôle de ce SW est uniquement le push.

self.addEventListener("push", (event) => {
  let data = { title: "Progressa", body: "Ta séance t'attend.", url: "/semaine" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // payload non-JSON : on garde les valeurs par défaut
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/api/pwa-icon?size=192",
      badge: "/api/pwa-icon?size=192",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/semaine";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
