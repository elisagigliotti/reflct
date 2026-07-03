// RootNavigator — stack radice. Senza sessione: Onboarding -> Login/Register.
// Con sessione valida: MainTabs. Il pattern e' il conditional-rendering
// idiomatico di React Navigation (non un guard per-route come sul web):
// quando isAuthenticated cambia, il Navigator rimonta con l'altro set di screen.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/theme';
import { useAuth } from '../state/AuthContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MainTabs from './MainTabs';
import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Ripristino sessione in corso (token salvato + GET /users/me): niente flash
    // di Onboarding/Login prima di sapere se l'utente e' gia' loggato.
    return <View style={styles.splash} />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <>
            <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.desktop,
  },
});
