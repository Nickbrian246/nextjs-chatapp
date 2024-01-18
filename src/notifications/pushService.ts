import { getReadyServicesWorker } from "@/utils/serviceWorker";

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  const sw = await getReadyServicesWorker();
  return sw.pushManager.getSubscription();
}

export async function registerPushNotifications() {
  if (!("PushManager" in window)) {
    throw Error("Notificaciones de tipo push no soportadasa por el navegador");
  }
  const existingsubscription = await getCurrentPushSubscription();
  if (existingsubscription) {
    throw Error("Existing push subscription found");
  }
  const sw = await getReadyServicesWorker();
  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
  });
  await sendPushsubscriptionToServer(subscription);
}

export async function unRegisterPushNotification() {
  const existingsubscription = await getCurrentPushSubscription();
  if (!existingsubscription) {
    throw Error("Not found a push subscription");
  }
  await deletePushsubscriptionFromServer(existingsubscription);

  await existingsubscription.unsubscribe();
}

export async function sendPushsubscriptionToServer(
  subscription: PushSubscription
) {
  const response = await fetch("/api/register-push", {
    method: "POST",
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw Error("fail to send push subscription to server");
  }
}

export async function deletePushsubscriptionFromServer(
  subscription: PushSubscription
) {
  console.log("ejecutando");

  const response = await fetch("/api/register-push", {
    method: "DELETE",
    body: JSON.stringify(subscription),
  });
  console.log(response);

  if (!response.ok) {
    throw Error("fail to delete push subscription from  server");
  }
}
