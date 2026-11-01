import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useEquipTrack } from '@/context/EquipTrackContext';
import { Radius, Spacing } from '@/constants/theme';

const TABS = [
  {
    name: 'inscription',
    label: 'Inscription',
    icon: 'person-add',
  },
  {
    name: 'index',
    label: 'Répertoire',
    icon: 'contacts',
  },
  {
    name: 'historique',
    label: 'Historique',
    icon: 'history',
  },
  {
    name: 'parametres',
    label: 'Paramètres',
    icon: 'settings',
  },
];

export function CustomBottomTabBar(props) {
  const { state, navigateToTab, navigation } = props;
  const { colors, triggerHapticFeedback } = useEquipTrack();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
        },
      ]}>
      <View style={styles.tabContainer}>
        {TABS.map((tab) => {
          // Find route index in state
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isFocused = state.index === routeIndex;
          const targetKey = state.routes[routeIndex]?.key;

          const onPress = () => {
            triggerHapticFeedback();
            if (navigation?.navigate) {
              navigation.navigate(tab.name);
            } else if (navigateToTab && targetKey) {
              navigateToTab(targetKey);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              style={[
                styles.tabButton,
                isFocused && [
                  styles.activeTabButton,
                  { backgroundColor: colors.primaryContainer },
                ],
              ]}>
              <MaterialIcons
                name={tab.icon}
                size={22}
                color={isFocused ? '#ffffff' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? '#ffffff' : colors.textSecondary,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabContainer: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.two,
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.lg,
    minWidth: 70,
  },
  activeTabButton: {
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.four,
    elevation: 2,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
