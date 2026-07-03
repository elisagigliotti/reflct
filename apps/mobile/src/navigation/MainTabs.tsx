// MainTabs — la "taskbar" reskinnata come tab bar nativa: 4 tab persistenti
// (Feed/Prova/Armadio/Io), sfondo rosa #FBDCE8, bordo-top nero, icone glifo.
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borders, nav } from '../theme/theme';
import TaskbarIcon from '../ui/TaskbarIcon';
import { FeedStackNavigator, TryOnStackNavigator, WardrobeStackNavigator, ProfileStackNavigator } from './stacks';
import { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const ICON_BY_KEY: Record<string, { icon: string; label: string }> = {
  Feed: nav[0],
  Prova: nav[1],
  Armadio: nav[2],
  Io: nav[3],
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.win,
          borderTopWidth: borders.width,
          borderTopColor: colors.ink,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 4,
        },
        tabBarIcon: ({ focused }) => {
          const meta = ICON_BY_KEY[route.name];
          return <TaskbarIcon icon={meta.icon} label={meta.label} active={focused} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedStackNavigator} />
      <Tab.Screen name="Prova" component={TryOnStackNavigator} />
      <Tab.Screen name="Armadio" component={WardrobeStackNavigator} />
      <Tab.Screen name="Io" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
