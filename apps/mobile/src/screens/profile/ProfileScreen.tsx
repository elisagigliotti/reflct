// Profilo / Io (profile.sys / measures.cfg / settings.ini) — dati REALI da
// GET/PATCH /api/v1/users/me (com.reflct.api.user), non piu' mock. Le "stats"
// decorative del Concept v4.0 sono state rimosse: non c'e' ancora un endpoint
// che le calcoli davvero (vedi apps/web/src/app/features/profile per la stessa scelta).
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borders, shadowOffsets, spacing } from '../../theme/theme';
import { useAuth } from '../../state/AuthContext';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Stamp from '../../ui/Stamp';
import Row from '../../ui/Row';
import Btn95 from '../../ui/Btn95';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, logout, updateMe } = useAuth();

  const [editing, setEditing] = useState(false);
  const [nomeDraft, setNomeDraft] = useState('');
  const [altezzaDraft, setAltezzaDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!user) {
    return (
      <DesktopBackground>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Caricamento profilo…</Text>
        </View>
      </DesktopBackground>
    );
  }

  const startEdit = () => {
    setNomeDraft(user.nome);
    setAltezzaDraft(user.altezzaCm ? String(user.altezzaCm) : '');
    setSaveError(null);
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateMe({
        nome: nomeDraft.trim() || null,
        altezzaCm: altezzaDraft.trim() ? Number(altezzaDraft) : null,
      });
      setEditing(false);
    } catch {
      setSaveError('Salvataggio non riuscito. Riprova.');
    } finally {
      setSaving(false);
    }
  };

  const toggleUnits = () => {
    updateMe({ unitaMisura: user.unitaMisura === 'cm' ? 'in' : 'cm' });
  };

  return (
    <DesktopBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: 20 }]}
      >
        <Menubar menuItems={['Profilo', 'Misure', 'Esci']} />

        <UiWindow style={styles.blockGap}>
          <WinTitle label="profile.sys" icon="👤" />
          <View style={styles.profilePad}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarFace}>☻</Text>
              </View>
              <View style={styles.identity}>
                <View style={styles.nameRow}>
                  <Text style={styles.username}>
                    {user.nome}
                    <Text style={{ color: colors.pink }}>_</Text>
                  </Text>
                  {user.piano !== 'FREE' && <Stamp label={user.piano} color={colors.yellow} style={styles.premiumStamp} />}
                </View>
                <Text style={styles.handle}>{user.email}</Text>
              </View>
            </View>
            <Btn95 label="↩ ESCI" style={styles.logoutBtn} onPress={logout} />
          </View>
        </UiWindow>

        <UiWindow variant="mint" style={styles.blockGap}>
          <WinTitle label="measures.cfg" variant="teal" />
          <View style={styles.pad}>
            {!editing ? (
              <>
                <Row keyLabel="altezza" valueLabel={user.altezzaCm ? `${user.altezzaCm} cm` : 'non impostata'} />
                <Text style={styles.hint}>
                  Le altre misure (busto, vita, taglie…) arrivano dal body-scan — ancora da collegare.
                </Text>
                <Btn95 label="✎ MODIFICA PROFILO" variant="cyan" block style={styles.editBtn} onPress={startEdit} />
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Nome</Text>
                <View style={styles.inputWrap}>
                  <View pointerEvents="none" style={styles.inputShadow} />
                  <TextInput value={nomeDraft} onChangeText={setNomeDraft} style={styles.input} />
                </View>
                <Text style={styles.fieldLabel}>Altezza (cm)</Text>
                <View style={styles.inputWrap}>
                  <View pointerEvents="none" style={styles.inputShadow} />
                  <TextInput
                    value={altezzaDraft}
                    onChangeText={setAltezzaDraft}
                    style={styles.input}
                    keyboardType="number-pad"
                  />
                </View>
                {saveError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{saveError}</Text>
                  </View>
                )}
                <View style={styles.editActions}>
                  <Btn95
                    label={saving ? 'SALVO…' : 'SALVA'}
                    variant="cta"
                    disabled={saving}
                    style={styles.editActionBtn}
                    onPress={save}
                  />
                  <Btn95
                    label="ANNULLA"
                    disabled={saving}
                    style={styles.editActionBtn}
                    onPress={() => setEditing(false)}
                  />
                </View>
              </>
            )}
            <Btn95
              label="↻ RIFAI IL BODY-SCAN"
              variant="cyan"
              block
              style={styles.rescanBtn}
              onPress={() => navigation.getParent()?.navigate('Prova', { screen: 'TryOnHome' })}
            />
          </View>
        </UiWindow>

        <UiWindow style={styles.blockGap}>
          <WinTitle label="settings.ini" />
          <View style={styles.settingsPad}>
            <Row icon="🔔" keyLabel="Notifiche" showChevron />
            <Row icon="🔒" keyLabel="Privacy & avatar" showChevron />
            <Row icon="📏" keyLabel="Unità di misura" valueLabel={user.unitaMisura} onPress={toggleUnits} />
            <Row icon="❔" keyLabel="Aiuto" showChevron />
          </View>
        </UiWindow>

        <View style={styles.stickerRow}>
          <View style={[styles.sticker, { backgroundColor: colors.cyan }]}>
            <Text style={styles.stickerGlyph}>★</Text>
          </View>
          <View style={[styles.sticker, { backgroundColor: colors.pink }]}>
            <Text style={styles.stickerGlyph}>♥</Text>
          </View>
          <View style={[styles.sticker, { backgroundColor: colors.yellow }]}>
            <Text style={styles.stickerGlyph}>✦</Text>
          </View>
        </View>
      </ScrollView>
    </DesktopBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 12 },
  blockGap: { marginBottom: spacing.blockGap },
  pad: { padding: spacing.windowPadding },
  profilePad: { padding: spacing.windowPadding },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: fonts.body, fontSize: 16, color: colors.muted },
  avatarRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 66,
    height: 66,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 4,
    backgroundColor: colors.lav,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFace: {
    fontSize: 28,
    color: colors.ink,
  },
  identity: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontFamily: fonts.pixel,
    fontSize: 20,
    color: colors.ink,
  },
  premiumStamp: {
    marginLeft: 2,
  },
  handle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
  },
  logoutBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    marginTop: -4,
  },
  fieldLabel: {
    fontFamily: fonts.chrome,
    fontSize: 9,
    color: colors.ink2,
    textTransform: 'uppercase',
  },
  inputWrap: {
    position: 'relative',
    marginBottom: 4,
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
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  errorBox: {
    borderWidth: 2,
    borderColor: colors.warn,
    borderRadius: borders.radius.button,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.warn,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionBtn: {
    flex: 1,
  },
  rescanBtn: {
    marginTop: 12,
  },
  editBtn: {
    marginTop: 4,
  },
  settingsPad: {
    paddingVertical: 4,
  },
  stickerRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  sticker: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerGlyph: {
    fontSize: 20,
    color: colors.ink,
  },
});
