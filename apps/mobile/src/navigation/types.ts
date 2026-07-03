// Param list dei navigator, per typing forte di navigation.navigate(...).
import { NavigatorScreenParams } from '@react-navigation/native';

export type FeedStackParamList = {
  FeedHome: undefined;
  Import: undefined;
  Social: undefined;
};

export type TryOnStackParamList = {
  TryOnHome: { itemId?: string | number } | undefined;
  Share: { itemId?: string | number } | undefined;
};

export type WardrobeStackParamList = {
  WardrobeHome: undefined;
  PriceTracker: undefined;
  Share: { itemId?: string | number } | undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
};

export type MainTabsParamList = {
  Feed: NavigatorScreenParams<FeedStackParamList>;
  Prova: NavigatorScreenParams<TryOnStackParamList>;
  Armadio: NavigatorScreenParams<WardrobeStackParamList>;
  Io: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
