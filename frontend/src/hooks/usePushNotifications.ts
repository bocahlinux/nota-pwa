import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const PUSH_API = '/api/push';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;
    setLoading(true);
    try {
      // Get VAPID public key
      const { data: vapid } = await api.get(PUSH_API + '/vapid-key/');
      const vapidPublicKey = vapid.publicKey;
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw-push.js', { scope: '/' });

      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send to backend
      await api.post(PUSH_API + '/subscribe/', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh') || []))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth') || []))),
        },
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await api.post(PUSH_API + '/unsubscribe/', { endpoint: subscription.endpoint });
          await subscription.unsubscribe();
        }
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Push unsubscribe failed:', err);
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  const toggle = useCallback(async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return false;
      }
      return await subscribe();
    }
    return !isSubscribed;
  }, [isSubscribed, permission, subscribe, unsubscribe, requestPermission]);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    requestPermission,
    subscribe,
    unsubscribe,
    toggle,
  };
}
