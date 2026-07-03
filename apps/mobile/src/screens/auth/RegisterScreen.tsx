// register.exe — crea account. Schermata nuova, reskin retro-OS.
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [username, setUsername] = useState('');
  const [dataNascita, setDataNascita] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [altezzaCm, setAltezzaCm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!nome.trim() || !cognome.trim() || !username.trim() || !dataNascita.trim() || !email.trim() || !password) {
      setError('Compila nome, cognome, username, data di nascita, email e password');
      return;
    }
    if (password.length < 8) {
      setError('La password deve avere almeno 8 caratteri');
      return;
    }
    if (!/^[a-zA-Z0-9._]+$/.test(username.trim())) {
      setError('Username: solo lettere, numeri, punto e underscore');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const altezza = altezzaCm.trim() ? Number(altezzaCm) : null;
      await register({
        nome: nome.trim(),
        cognome: cognome.trim(),
        username: username.trim(),
        dataNascita: dataNascita.trim(),
        email: email.trim(),
        password,
        altezzaCm: altezza,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registrazione non riuscita. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DesktopBackground>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
      >
        <UiWindow>
          <WinTitle label="register.exe — crea account" />
          <View style={styles.body}>
            <Text style={styles.title}>
              benvenuta
              <Text style={{ color: colors.pink }}>_</Text>
            </Text>

            <Text style={styles.fieldLabel}>Nome</Text>
            <View style={styles.inputWrap}>
              <View pointerEvents="none" style={styles.inputShadow} />
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder="giulia"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCorrect={false}
              />
            </View>

            <Text style={styles.fieldLabel}>Cognome</Text>
            <View style={styles.inputWrap}>
              <View pointerEvents="none" style={styles.inputShadow} />
              <TextInput
                value={cognome}
                onChangeText={setCognome}
                placeholder="rossi"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCorrect={false}
              />
            </View>

            <Text style={styles.fieldLabel}>Username</Text>
            <View style={styles.inputWrap}>
              <View pointerEvents="none" style={styles.inputShadow} />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="giulia_r"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.fieldLabel}>Data di nascita (AAAA-MM-GG)</Text>
            <View style={styles.inputWrap}>
              <View pointerEvents="none" style={styles.inputShadow} />
              <TextInput
                value={dataNascita}
                onChangeText={setDataNascita}
                placeholder="2000-01-01"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCorrect={false}
              />
            </View>

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
                placeholder="min. 8 caratteri"
                placeholderTextColor={colors.muted}
                style={styles.input}
                secureTextEntry
              />
            </View>

            <Text style={styles.fieldLabel}>Altezza (cm) — opzionale</Text>
            <View style={styles.inputWrap}>
              <View pointerEvents="none" style={styles.inputShadow} />
              <TextInput
                value={altezzaCm}
                onChangeText={setAltezzaCm}
                placeholder="168"
                placeholderTextColor={colors.muted}
                style={styles.input}
                keyboardType="number-pad"
              />
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Btn95
              label={loading ? 'CREAZIONE IN CORSO…' : 'REGISTRATI'}
              variant="cta"
              block
              disabled={loading}
              style={styles.cta}
              onPress={submit}
            />

            <Pressable onPress={() => navigation.navigate('Login')} style={styles.switchRow}>
              <Text style={styles.switchText}>
                Hai già un account? <Text style={styles.switchLink}>Accedi</Text>
              </Text>
            </Pressable>
          </View>
        </UiWindow>
      </ScrollView>
    </DesktopBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
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
