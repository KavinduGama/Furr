"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidExpoPushToken = isValidExpoPushToken;
exports.sendExpoPushNotifications = sendExpoPushNotifications;
function isValidExpoPushToken(token) {
    if (typeof token !== 'string')
        return false;
    return token.startsWith('ExponentPushToken[') ||
        token.startsWith('ExpoPushToken[') ||
        token.startsWith('ExponentPushToken') ||
        token.startsWith('ExpoPushToken');
}
async function sendExpoPushNotifications(messages) {
    if (messages.length === 0)
        return;
    const validMessages = messages.filter((m) => {
        if (Array.isArray(m.to)) {
            return m.to.length > 0 && m.to.every(isValidExpoPushToken);
        }
        return isValidExpoPushToken(m.to);
    });
    if (validMessages.length === 0)
        return;
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
    }
    catch (error) {
        console.error('Error sending Expo push notifications:', error);
    }
}
//# sourceMappingURL=expoPush.js.map