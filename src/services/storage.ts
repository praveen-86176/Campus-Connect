import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@campusconnect';

const buildKey = (key: string) => `${PREFIX}:${key}`;

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(buildKey(key));
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      console.warn('Storage get error', error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(buildKey(key), JSON.stringify(value));
    } catch (error) {
      console.warn('Storage set error', error);
    }
  },
};
