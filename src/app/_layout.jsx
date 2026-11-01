import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { EquipTrackProvider, useEquipTrack } from '@/context/EquipTrackContext';
import { HeaderBar } from '@/components/HeaderBar';
import { CustomBottomTabBar } from '@/components/BottomTabBar';
import { Toast } from '@/components/Toast';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { theme, colors } = useEquipTrack();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <HeaderBar />
      <Toast />
      <Tabs
        tabBar={(props) => <CustomBottomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
        <Tabs.Screen
          name="inscription"
          options={{
            title: 'Inscription',
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Répertoire',
          }}
        />
        <Tabs.Screen
          name="historique"
          options={{
            title: 'Historique',
          }}
        />
        <Tabs.Screen
          name="parametres"
          options={{
            title: 'Paramètres',
          }}
        />
      </Tabs>
    </View>
  );
}

export default function RootLayout() {
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
