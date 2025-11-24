import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
if (Platform.OS === 'web') {
  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const msg = args[0];
    if (typeof msg === 'string' && msg.includes('props.pointerEvents is deprecated')) {
      return;
    }
    originalWarn(...args);
  };
}
registerRootComponent(App);
