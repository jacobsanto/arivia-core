import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const useAppUpdate = () => {
  const [needRefresh, setNeedRefresh] = useState(false);

  const {
    needRefresh: [needRefreshValue, setNeedRefreshValue],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });

  useEffect(() => {
    setNeedRefresh(needRefreshValue);
  }, [needRefreshValue]);

  const updateApp = () => {
    updateServiceWorker(true);
  };

  const dismissUpdate = () => {
    setNeedRefreshValue(false);
    setNeedRefresh(false);
  };

  return {
    needRefresh,
    updateApp,
    dismissUpdate,
  };
};
