/**
 * Send push notifications via Expo's push notification service (MED-007).
 */
export interface ExpoPushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

export function isValidExpoPushToken(token: string): boolean {
  if (typeof token !== 'string') return false;
  return token.startsWith('ExponentPushToken[') ||
         token.startsWith('ExpoPushToken[') ||
         token.startsWith('ExponentPushToken') ||
         token.startsWith('ExpoPushToken');
}

export async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  const validMessages = messages.filter((m) => {
    if (Array.isArray(m.to)) {
      return m.to.length > 0 && m.to.every(isValidExpoPushToken);
    }
    return isValidExpoPushToken(m.to);
  });

  if (validMessages.length === 0) return;

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validMessages),
    });

    if (!response.ok) {
      console.error('Expo push dispatch failed:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending Expo push notifications:', error);
  }
}
