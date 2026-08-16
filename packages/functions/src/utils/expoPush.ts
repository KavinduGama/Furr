/**
 * Send push notifications via Expo's free push notification service.
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

export async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  const validMessages = messages.filter((m) => {
    if (Array.isArray(m.to)) {
      return m.to.length > 0;
    }
    return typeof m.to === 'string' && m.to.startsWith('ExponentPushToken');
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
