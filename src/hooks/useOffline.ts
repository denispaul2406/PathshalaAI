import { useState, useEffect } from 'react';
import { 
  initOfflineDB, 
  getOfflinePDFs, 
  getStorageUsage,
  isOnline,
  registerServiceWorker,
  type OfflinePDF,
} from '@/services/offline';
import { toast } from 'sonner';

export function useOffline() {
  const [online, setOnline] = useState(isOnline());
  const [pdfs, setPdfs] = useState<OfflinePDF[]>([]);
  const [storageUsage, setStorageUsage] = useState({
    total: 0,
    pdfs: 0,
    questions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize offline DB and service worker
    const init = async () => {
      try {
        await initOfflineDB();
        await registerServiceWorker();
        await loadOfflineData();
      } catch (error) {
        console.error('Error initializing offline mode:', error);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Listen for online/offline events
    const handleOnline = () => {
      setOnline(true);
      toast.success('Back online!');
    };

    const handleOffline = () => {
      setOnline(false);
      toast.info('You are offline. Offline content is available.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = async () => {
    try {
      const [offlinePdfs, usage] = await Promise.all([
        getOfflinePDFs(),
        getStorageUsage(),
      ]);
      setPdfs(offlinePdfs);
      setStorageUsage(usage);
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const refreshOfflineData = async () => {
    await loadOfflineData();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return {
    online,
    pdfs,
    storageUsage,
    loading,
    refreshOfflineData,
    formatBytes,
  };
}

