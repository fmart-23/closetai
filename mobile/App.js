import React, { useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import AppNavigator from './src/navigation/AppNavigator';
import Colors from './src/constants/colors';

// Keep the splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = React.useState(false);

  const prepare = useCallback(async () => {
    try {
      // Pre-load any fonts / resources here if needed
      // await Font.loadAsync({ ... });
    } catch (e) {
      // Warn but don't crash
      console.warn('App preparation error:', e);
    } finally {
      setAppReady(true);
    }
  }, []);

  useEffect(() => {
    prepare();
  }, [prepare]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
});
