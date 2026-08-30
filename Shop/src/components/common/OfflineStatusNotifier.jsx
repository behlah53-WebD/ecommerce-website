import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineStatusNotifier() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showOnlineRecovery, setShowOnlineRecovery] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineRecovery(true);
      const timer = setTimeout(() => setShowOnlineRecovery(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineRecovery(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showOnlineRecovery) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      aria-label="Network status banner"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-2 px-4 text-xs font-semibold shadow-md transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      style={{
        backgroundColor: !isOnline ? '#dc2626' : '#16a34a',
        color: '#ffffff',
      }}
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto">
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4 flex-shrink-0 animate-pulse" />
            <span>You are currently offline. Viewing cached pages & offline content.</span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4 flex-shrink-0" />
            <span>Connection restored. You are back online!</span>
          </>
        )}
      </div>
    </aside>
  );
}

export default OfflineStatusNotifier;
