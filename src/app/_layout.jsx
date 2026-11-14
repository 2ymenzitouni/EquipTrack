import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { EquipTrackProvider, useEquipTrack } from '@context/EquipTrackContext';
import { HeaderBar } from '@components/HeaderBar';
import { CustomBottomTabBar } from '@components/BottomTabBar';
import { Toast } from '@components/Toast';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { theme, colors, applyScannedAppearanceConfig } = useEquipTrack();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Intercepter le paramètre config dans l'URL et mettre à jour le design
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const configParam = params.get('config');

      if (configParam) {
        try {
          const decoded = decodeURIComponent(configParam);
          if (applyScannedAppearanceConfig) {
            applyScannedAppearanceConfig(decoded);
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error("Erreur de décodage de la configuration URL", e);
        }
      }
    }
  }, [applyScannedAppearanceConfig]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <HeaderBar />
      <Tabs
        tabBar={(props) => <CustomBottomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      />
      <Toast />
    </View>
  );
}

export default function Layout() {
  return (
    <EquipTrackProvider>
      <RootNavigator />
    </EquipTrackProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
