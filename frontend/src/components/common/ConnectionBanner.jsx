import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ConnectionBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-cg-risk text-white text-xs font-medium px-4 py-2 flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md"
        >
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Connection disrupted — reconnecting to ChurnGuard AI real-time stream...</span>
          <RefreshCw className="w-3.5 h-3.5 animate-spin ml-2" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
