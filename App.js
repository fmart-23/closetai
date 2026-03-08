/**
 * ClosetAI — Native iOS App Entry Point
 * Built with React Native + Expo
 *
 * Features:
 * - On-device clothing classification (TF Lite + manual fallback)
 * - Digital closet management with local storage
 * - AI-powered outfit recommendations (offline, rule-based)
 * - Clean, fashion-forward iOS UI
 */
import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { loadModel } from './src/services/classifier';

// Keep the splash screen visible while we load resources
SplashScreen.preventAutoHideAsync();

// Suppress known warnings from dependencies
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycles are allowed in bundler',
]);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load AI model in the background (non-blocking)
        loadModel().catch(() => {
          // Model load failure is acceptable — falls back to manual classification
        });

        // Simulate a short splash screen duration for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('App preparation error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
