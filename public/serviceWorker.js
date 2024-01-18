// @ts-check

/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = /** @type {ServiceWorkerGlobalScope & typeof globalThis} */ (
  globalThis
);
//@ts-nocheck
sw.addEventListener("push", (event) => {
  const message = event.data?.json();
  const { title, body, icon, image, channelId } = message;

  async function handlePushEvent() {
    const windowClients = await sw.clients.matchAll({ type: "window" });

    if (windowClients.length > 0) {
      const appInForeground = windowClients.some((client) => client.focus);
      if (appInForeground) return;
    }
    await sw.registration.showNotification(title, {
      body,
      icon,
      image,
      badge: "/flowchat_logo.png",
      actions: [{ title: "open chant", action: "open_chat" }],
      tag: channelId,
      renotify: true,
      data: { channelId },
    });
  }

  event.waitUntil(handlePushEvent());
});

sw.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  notification.close();

  async function handleNotificationClick() {
    const windowClient = await sw.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    const channelId = notification.data.channelId;

    if (windowClient.length > 0) {
      await windowClient[0].focus();
      windowClient[0].postMessage({ channelId });
    } else {
      sw.clients.openWindow("/chat?channelId=" + channelId);
    }
  }

  event.waitUntil(handleNotificationClick());
});
