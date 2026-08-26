// FocusTM Admin — push notification service worker.
// Handles two things: an incoming push message from the backend, and a
// click on the notification it produced (focuses/opens the relevant
// admin page instead of just dismissing).

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "FocusTM", body: event.data.text() };
  }

  const title = payload.title || "FocusTM Admin";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/logo.png",
    badge: payload.badge || "/logo.png",
    image: payload.image,
    tag: payload.tag,
    requireInteraction: !!payload.requireInteraction,
    timestamp: payload.timestamp || Date.now(),
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetPath = (event.notification.data && event.notification.data.url) || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin && "focus" in client) {
          client.navigate(targetPath);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetPath);
      }
    }),
  );
});
