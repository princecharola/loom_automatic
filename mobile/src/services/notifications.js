import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Machine Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250]
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const permissionResponse = await Notifications.requestPermissionsAsync();
    finalStatus = permissionResponse.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  return Notifications.getExpoPushTokenAsync().then((result) => result.data);
}

export async function sendInAppAlertNotification(alert) {
  if (!alert?.machineId || !alert?.message) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Machine ${alert.machineId}`,
      body: alert.message,
      data: { type: alert.type || 'warning' }
    },
    trigger: null
  });
}
