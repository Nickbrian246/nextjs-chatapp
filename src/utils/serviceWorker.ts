export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw Error(" serviceWorkers no es soportado por este navegador");
  }
  await navigator.serviceWorker.register("/serviceWorker.js");
}

export async function getReadyServicesWorker() {
  if (!("serviceWorker" in navigator)) {
    throw Error(" serviceWorkers no es soportado por este navegador");
  }
  return navigator.serviceWorker.ready;
}
