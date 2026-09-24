import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isSystemOnline, setIsSystemOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsSystemOnline(true);
    const handleOffline = () => setIsSystemOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOnline = isSystemOnline && !simulatedOffline;

  const toggleOfflineSimulation = () => {
    setSimulatedOffline((prev) => !prev);
  };

  return {
    isOnline,
    isSystemOnline,
    simulatedOffline,
    toggleOfflineSimulation,
  };
}
