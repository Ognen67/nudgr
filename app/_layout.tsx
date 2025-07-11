import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-reanimated';

import { RefreshProvider } from '@/contexts/RefreshContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: TNodeChildrenRenderer',
  'Warning: MemoizedTNodeRenderer',
  'Warning: TRenderEngineProvider',
]);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter: require('../assets/fonts/Inter.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      // Hide splash screen when fonts are loaded
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <RefreshProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" backgroundColor="#272727" />
      </ThemeProvider>
    </RefreshProvider>
  );
}
