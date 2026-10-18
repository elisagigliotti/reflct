// Body-scan reale: altezza -> scatto fotocamera (front) -> upload -> stima
// misure (com.reflct.api.bodyscan -> ai-service MediaPipe Pose). Raggiunta da
// Profilo ("RIFAI IL BODY-SCAN") e da Prova quando non c'e' ancora una scansione.
import React, { useMemo, useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fonts, borders, spacing } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeContext';
import { ReflctPalette } from '../../../../../packages/design-tokens/rn/theme';
import { useAuth } from '../../state/AuthContext';
import { uploadImage } from '../../api/media';
import { bodyScanApi, BodyMeasures } from '../../api/bodyscan';
import { ApiError } from '../../api/client';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Btn95 from '../../ui/Btn95';
import Row from '../../ui/Row';
import CameraCapture from '../../ui/CameraCapture';
import { TryOnStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TryOnStackParamList, 'BodyScan'>;

type Step = 'height' | 'camera' | 'confirm' | 'analyzing' | 'result' | 'error';

const MEASURE_LABELS: Record<keyof BodyMeasures, string> = {
  busto_cm: 'busto',
  vita_cm: 'vita',
  fianchi_cm: 'fianchi',
  spalle_cm: 'spalle',
  torso_cm: 'torso',
  inseam_cm: 'cavallo',
  manica_cm: 'manica',
  confidence: 'confidenza',
};

export default function BodyScanScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, updateMe } = useAuth();

  const [step, setStep] = useState<Step>(user?.altezzaCm ? 'camera' : 'height');
  const [altezzaDraft, setAltezzaDraft] = useState(user?.altezzaCm ? String(user.altezzaCm) : '');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [measures, setMeasures] = useState<BodyMeasures | null>(null);

  const confirmHeight = () => {
    const cm = Number(altezzaDraft);
    if (!cm || cm < 100 || cm > 230) {
      setErrorMsg('Inserisci un\'altezza valida in cm (100–230).');
      return;
    }
    setErrorMsg(null);
    updateMe({ altezzaCm: cm }).catch(() => {});
    setStep('camera');
  };

  const onCapture = (uri: string) => {
    setCapturedUri(uri);
    setStep('confirm');
  };

  const runAnalysis = async () => {
    if (!capturedUri) return;
    setStep('analyzing');
    setErrorMsg(null);
    try {
      const uploadedUrl = await uploadImage(capturedUri);
      const altezzaCm = Number(altezzaDraft) || user?.altezzaCm || 170;
      const scan = await bodyScanApi.start({ fotoFrontUrl: uploadedUrl, altezzaCm });
      const parsed: BodyMeasures | null = scan.misureJson ? JSON.parse(scan.misureJson) : null;
      if (scan.status === 'FAILED' || !parsed) {
        setErrorMsg('Analisi non riuscita. Riprova con un\'altra foto.');
        setStep('error');
        return;
      }
      setMeasures(parsed);
      setStep('result');
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Errore imprevisto durante l\'analisi.');
      setStep('error');
    }
  };

  if (step === 'camera') {
    return (
      <CameraCapture
        facingDefault="front"
        guideLabel="Di fronte, a figura intera, buona luce"
        onCapture={onCapture}
        onCancel={() => navigation.goBack()}
      />
    );
  }

  return (
    <DesktopBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: 20 }]}
      >
        <Menubar menuItems={['Scan', 'Misure']} />

        <UiWindow>
          <WinTitle label="bodyscan.exe" icon="📷" />
          <View style={styles.pad}>
            {step === 'height' && (
              <>
                <Text style={styles.label}>Qual e' la tua altezza?</Text>
                <Text style={styles.hint}>
                  Serve per calibrare le misure stimate dalla foto (nessun'altra misura corporea e'
                  necessaria: le calcoliamo noi dallo scatto).
                </Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    value={altezzaDraft}
                    onChangeText={setAltezzaDraft}
                    keyboardType="number-pad"
                    placeholder="es. 170"
                    style={styles.input}
                  />
                  <Text style={styles.inputSuffix}>cm</Text>
                </View>
                {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
                <Btn95 label="Continua →" variant="cta" block style={styles.actionBtn} onPress={confirmHeight} />
              </>
            )}

            {step === 'confirm' && capturedUri && (
              <>
                <Text style={styles.label}>Va bene questa foto?</Text>
                <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="cover" />
                <View style={styles.actionsRow}>
                  <Btn95 label="↺ Rifai" style={styles.actionBtnFlex} onPress={() => setStep('camera')} />
                  <Btn95 label="✓ Analizza" variant="cta" style={styles.actionBtnFlex} onPress={runAnalysis} />
                </View>
              </>
            )}

            {step === 'analyzing' && (
              <View style={styles.centerPad}>
                <Text style={styles.label}>Analisi in corso…</Text>
                <Text style={styles.hint}>Rilevamento corpo e stima misure via MediaPipe Pose.</Text>
              </View>
            )}

            {step === 'error' && (
              <>
                <Text style={[styles.label, { color: colors.warn }]}>Non ci siamo</Text>
                <Text style={styles.hint}>{errorMsg}</Text>
                <Btn95 label="↺ Riprova" variant="cyan" block style={styles.actionBtn} onPress={() => setStep('camera')} />
              </>
            )}

            {step === 'result' && measures && (
              <>
                <Text style={styles.label}>Misure stimate</Text>
                {(Object.keys(MEASURE_LABELS) as (keyof BodyMeasures)[])
                  .filter((k) => k !== 'confidence' && measures[k] != null)
                  .map((k) => (
                    <Row key={k} keyLabel={MEASURE_LABELS[k]} valueLabel={`${measures[k]} cm`} />
                  ))}
                {measures.confidence != null && (
                  <Text style={styles.hint}>Confidenza stima: {Math.round(measures.confidence * 100)}%</Text>
                )}
                <Btn95 label="✓ Fatto" variant="cta" block style={styles.actionBtn} onPress={() => navigation.goBack()} />
              </>
            )}
          </View>
        </UiWindow>
      </ScrollView>
    </DesktopBackground>
  );
}

function createStyles(colors: ReflctPalette) {
  return StyleSheet.create({
    scroll: { flex: 1 },
    content: { paddingHorizontal: 12 },
    pad: { padding: spacing.windowPadding },
    label: {
      fontFamily: fonts.title,
      fontSize: 17,
      color: colors.ink,
      marginBottom: 6,
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: 15,
      color: colors.muted,
      marginBottom: 12,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: borders.width,
      borderColor: colors.ink,
      borderRadius: borders.radius.button,
      backgroundColor: colors.white,
      paddingHorizontal: 10,
      marginBottom: 12,
    },
    input: {
      flex: 1,
      paddingVertical: 8,
      fontFamily: fonts.body,
      fontSize: 18,
      color: colors.ink,
    },
    inputSuffix: {
      fontFamily: fonts.chrome,
      fontSize: 11,
      color: colors.muted,
    },
    error: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.warn,
      marginBottom: 8,
    },
    actionBtn: {
      marginTop: 4,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    actionBtnFlex: {
      flex: 1,
    },
    preview: {
      width: '100%',
      height: 320,
      borderWidth: borders.width,
      borderColor: colors.ink,
      borderRadius: borders.radius.window,
      marginBottom: 12,
      backgroundColor: colors.winAlt,
    },
    centerPad: {
      paddingVertical: 30,
      alignItems: 'center',
    },
  });
}
