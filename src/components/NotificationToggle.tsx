"use client";

import { useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import toast from "react-hot-toast";
import { usePushNotifications } from "@/lib/usePushNotifications";

export default function NotificationToggle({ className = "" }: { className?: string }) {
  const { status, busy, enable, disable, sendTest } = usePushNotifications();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "unsupported" || status === "checking") return null;

  const handleClick = async () => {
    if (status === "denied") {
      toast.error("Notifications are blocked for this site — enable them in your browser's site settings.");
      return;
    }
    if (status === "enabled") {
      setMenuOpen((v) => !v);
      return;
    }
    await enable();
    toast.success("Order alerts are on. You'll get a notification for every new order.");
  };

  const handleDisable = async () => {
    setMenuOpen(false);
    await disable();
    toast("Order alerts turned off for this device.", { icon: "🔕" });
  };

  const handleTest = async () => {
    setMenuOpen(false);
    try {
      await sendTest();
      toast.success("Test notification sent.");
    } catch {
      toast.error("Couldn't send a test — check that VAPID keys are set on the backend.");
    }
  };

  const Icon = status === "enabled" ? BellRing : status === "denied" ? BellOff : Bell;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        disabled={busy}
        aria-label="Order notifications"
        className={`h-8 w-8 flex items-center justify-center transition-colors duration-200 disabled:opacity-40 ${
          status === "enabled" ? "text-ftm-white" : "text-ftm-muted hover:text-ftm-white"
        }`}
      >
        <Icon className="h-[16px] w-[16px]" />
      </button>

      {menuOpen && status === "enabled" && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-10 z-40 w-56 bg-ftm-deep border border-ftm-line py-2">
            <p className="px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-ftm-dim">Order Alerts — On</p>
            <button onClick={handleTest} className="w-full text-left px-4 py-2.5 text-[11px] text-ftm-muted hover:text-ftm-white hover:bg-ftm-charcoal transition-colors">
              Send test notification
            </button>
            <button onClick={handleDisable} className="w-full text-left px-4 py-2.5 text-[11px] text-ftm-muted hover:text-red-400 hover:bg-ftm-charcoal transition-colors">
              Turn off on this device
            </button>
          </div>
        </>
      )}
    </div>
  );
}
