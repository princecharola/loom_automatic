import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@loom_monitoring/token';

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function persistToken(token) {
  if (!token) {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }

  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
