// login.exe — accedi. Schermata nuova, reskin retro-OS (equivalente mobile di
// apps/web/src/app/features/login).
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borders, shadowOffsets, spacing } from '../../theme/theme';
import { useAuth } from '../../state/AuthContext';
import { ApiError } from '../../api/client';
import DesktopBackground from '../../ui/DesktopBackground';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Btn95 from '../../ui/Btn95';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Inserisci email e password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login({ email: email.trim(), password });
      // Al successo isAuthenticated diventa true: RootNavigator monta MainTabs da solo.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Credenziali non valide. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DesktopBackground>
      <View style={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <UiWindow>
          <WinTitle label="login.exe — accedi" />
          <View style={styles.body}>
            <Text style={styles.title}>
              bentornata
              <Text style={{ color: colors.pink }}>_</Text>
            </Text>

            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputWrap}>
              <View pointerEvents="none" style={styles.inputShadow} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu@esempio.com"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <View pointerEvents="none" style={styles.inputShadow} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                style={styles.input}
                secureTextEntry
              />
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Btn95
              label={loading ? 'ACCESSO IN CORSO…' : 'ACCEDI'}
              variant="cta"
              block
              disabled={loading}
              style={styles.cta}
              onPress={submit}
            />

            <Pressable onPress={() => navigation.navigate('Register')} style={styles.switchRow}>
              <Text style={styles.switchText}>
                Non hai un account? <Text style={styles.switchLink}>Registrati</Text>
              </Text>
            </Pressable>
          </View>
        </UiWindow>
      </View>
    </DesktopBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  body: {
    padding: spacing.windowPadding,
    gap: 10,
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: fonts.chrome,
    fontSize: 10,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: -2,
  },
  inputWrap: {
    position: 'relative',
  },
  inputShadow: {
    position: 'absolute',
    top: shadowOffsets.button.y,
    left: shadowOffsets.button.x,
    right: -shadowOffsets.button.x,
    bottom: -shadowOffsets.button.y,
    backgroundColor: colors.ink,
    borderRadius: borders.radius.button,
  },
  input: {
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.button,
    backgroundColor: colors.white,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
  },
  errorBox: {
    borderWidth: 2,
    borderColor: colors.warn,
    borderRadius: borders.radius.button,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.warn,
  },
  cta: {
    marginTop: 4,
  },
  switchRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  switchText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink2,
  },
  switchLink: {
    color: colors.cyan,
    textDecorationLine: 'underline',
  },
});
