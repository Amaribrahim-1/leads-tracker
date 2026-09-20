"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function update() {
      setIsOffline(!navigator.onLine);
    }

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-mustard text-forest flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      <p>
        You&apos;re offline. Page navigations will retry when you&apos;re back.
        Lead saves will not.
      </p>
    </div>
  );
}
