import { getMessaging, getToken } from '@react-native-firebase/messaging';

import { api } from '../api/client';
import { endpoints } from '../api/endpoints';

export const notificationService = {
  async registerFcmToken(): Promise<void> {
    try {
      const messaging = getMessaging();

      // Get the actual FCM registration token
      const fcmToken = await getToken(messaging);

      if (!fcmToken) {
        console.log('FCM token not available');
        return;
      }

      // Save token using the authenticated API client
      await api.post(endpoints.chats.fcmToken, {
        fcm_token: fcmToken,
      });

      console.log('FCM token saved successfully');
    } catch (error) {
      console.log('FCM token registration failed:', error);
    }
  },
};