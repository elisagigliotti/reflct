// Stack navigator per ciascuna delle 4 tab principali: dentro ognuna si
// raggiungono le schermate "nuove" satelliti (Import da Feed, Social da Feed,
// PriceTracker da Armadio, Share da Prova/Armadio) senza occupare slot taskbar.
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeedScreen from '../screens/feed/FeedScreen';
import ImportScreen from '../screens/import/ImportScreen';
import SocialScreen from '../screens/social/SocialScreen';
import TryOnScreen from '../screens/tryon/TryOnScreen';
import ShareScreen from '../screens/share/ShareScreen';
import WardrobeScreen from '../screens/wardrobe/WardrobeScreen';
import PriceTrackerScreen from '../screens/priceTracker/PriceTrackerScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { FeedStackParamList, TryOnStackParamList, WardrobeStackParamList, ProfileStackParamList } from './types';

const noHeader = { headerShown: false } as const;

const FeedStack = createNativeStackNavigator<FeedStackParamList>();
export function FeedStackNavigator() {
  return (
    <FeedStack.Navigator screenOptions={noHeader}>
      <FeedStack.Screen name="FeedHome" component={FeedScreen} />
      <FeedStack.Screen name="Import" component={ImportScreen} />
      <FeedStack.Screen name="Social" component={SocialScreen} />
    </FeedStack.Navigator>
  );
}

const TryOnStack = createNativeStackNavigator<TryOnStackParamList>();
export function TryOnStackNavigator() {
  return (
    <TryOnStack.Navigator screenOptions={noHeader}>
      <TryOnStack.Screen name="TryOnHome" component={TryOnScreen} />
      <TryOnStack.Screen name="Share" component={ShareScreen} />
    </TryOnStack.Navigator>
  );
}

const WardrobeStack = createNativeStackNavigator<WardrobeStackParamList>();
export function WardrobeStackNavigator() {
  return (
    <WardrobeStack.Navigator screenOptions={noHeader}>
      <WardrobeStack.Screen name="WardrobeHome" component={WardrobeScreen} />
      <WardrobeStack.Screen name="PriceTracker" component={PriceTrackerScreen} />
      <WardrobeStack.Screen name="Share" component={ShareScreen} />
    </WardrobeStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
export function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={noHeader}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}
