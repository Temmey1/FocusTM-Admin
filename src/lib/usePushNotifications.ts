"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type PushStatus =
  | "unsupported"   // browser has no Push API (e.g. old Safari)
  | "checking"      // still figuring out current state
  | "denied"        // user blocked notification permission at the OS/browser level
  | "disabled"      // supported, permission not yet granted or subscription not active
  | "enabled";      // actively subscribed and receiving pushes

function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>("checking");
  const [busy, setBusy] = useState(false);

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const refreshStatus = useCallback(async () => {
    if (!supported) { setStatus("unsupported"); return; }
    if (Notification.permission === "denied") { setStatus("denied"); return; }

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setStatus(sub ? "enabled" : "disabled");
    } catch {
      setStatus("disabled");
    }
  }, [supported]);

  useEffect(() => { refreshStatus(); }, [refreshStatus]);

  const enable = useCallback(async () => {
    if (!supported) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); return; }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const { data } = await api.get<{ publicKey: string | null }>("/push-subscriptions/public-key");
      if (!data.publicKey) {
        // Backend has no VAPID keys configured yet — nothing to subscribe to.
        setStatus("disabled");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey) as BufferSource,
      });

      const json = sub.toJSON();
      await api.post("/push-subscriptions", {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        scope: "admin",
      });

      setStatus("enabled");
    } catch (err) {
      console.error("Failed to enable push notifications", err);
      setStatus("disabled");
    } finally {
      setBusy(false);
    }
  }, [supported]);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await api.delete("/push-subscriptions", { data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setStatus("disabled");
    } catch (err) {
      console.error("Failed to disable push notifications", err);
    } finally {
      setBusy(false);
    }
  }, []);

  const sendTest = useCallback(async () => {
    await api.post("/push-subscriptions/test", {
      title: "FocusTM — Test notification",
      body: "This is what a new order alert will look like.",
    });
  }, []);

  return { status, busy, enable, disable, sendTest };
}
