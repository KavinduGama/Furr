import { Platform } from 'react-native';
import { updatePushToken } from '@furr/firebase';

/**
 * Request notification permissions and register the Expo Push Token to Firestore.
 * Safely fails without throwing on simulator, web, or when notifications are denied.
 */
export async function registerForPushNotificationsAsync(uid: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const { default: Notifications } = await import('expo-notifications');

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    if (token && uid) {
      await updatePushToken(uid, token);
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B4A',
      });
    }

    return token;
  } catch (error) {
    console.warn('Push notification token registration info:', error);
    return null;
  }
}
