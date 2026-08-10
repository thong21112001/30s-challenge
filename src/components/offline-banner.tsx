'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOffline(!navigator.onLine);
    }

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-md px-4 py-3 text-amber-200 text-sm font-medium flex items-center justify-between z-50">
      <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
          <WifiOff className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-amber-400">⚠ Connection Lost</span>
          <p className="text-xs text-amber-200/80">
            Your 30-second challenge timer is still running on the server! Reconnect Wi-Fi to submit your result.
          </p>
        </div>
      </div>
    </div>
  );
}
