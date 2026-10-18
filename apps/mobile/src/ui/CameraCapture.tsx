// Cattura foto da fotocamera live, stile retro-OS (usata da body-scan e try-on).
// Wrapper riusabile attorno a expo-camera: gestisce permessi, switch
// fronte/retro e scatto, restituendo l'URI locale del file al chiamante.
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { borders, fonts } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { ReflctPalette } from '../../../../packages/design-tokens/rn/theme';
import Btn95 from './Btn95';

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  onCancel?: () => void;
  facingDefault?: CameraType;
  guideLabel?: string;
}

export default function CameraCapture({ onCapture, onCancel, facingDefault = 'back', guideLabel }: CameraCaptureProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>(facingDefault);
  const [taking, setTaking] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>Controllo permessi fotocamera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>
          Reflct ha bisogno della fotocamera per il body-scan e il try-on.
        </Text>
        <Btn95 label="Consenti fotocamera" variant="cta" onPress={requestPermission} style={styles.permBtn} />
        {onCancel && <Btn95 label="Annulla" onPress={onCancel} style={styles.permBtn} />}
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || taking) return;
    setTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        onCapture(photo.uri);
      }
    } finally {
      setTaking(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {guideLabel ? (
          <View style={styles.guideBadge}>
            <Text style={styles.guideText}>{guideLabel}</Text>
          </View>
        ) : null}
        <View pointerEvents="none" style={styles.frameGuide} />
        <View style={styles.controls}>
          <Pressable onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} style={styles.flipBtn}>
            <Text style={styles.flipGlyph}>⟲</Text>
          </Pressable>
          <Pressable onPress={takePicture} disabled={taking} style={styles.shutterOuter}>
            <View style={[styles.shutterInner, taking && styles.shutterInnerBusy]} />
          </Pressable>
          <View style={styles.flipBtnGhost} />
        </View>
      </CameraView>
      {onCancel && <Btn95 label="Annulla" onPress={onCancel} style={styles.cancelBtn} />}
    </View>
  );
}

function createStyles(colors: ReflctPalette) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
    },
    camera: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: 20,
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: 16,
      color: colors.ink,
      textAlign: 'center',
    },
    permBtn: {
      marginTop: 6,
    },
    guideBadge: {
      alignSelf: 'center',
      marginTop: 16,
      backgroundColor: colors.win,
      borderWidth: borders.width,
      borderColor: colors.ink,
      borderRadius: borders.radius.button,
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    guideText: {
      fontFamily: fonts.chrome,
      fontSize: 10,
      color: colors.ink,
    },
    frameGuide: {
      position: 'absolute',
      top: '12%',
      bottom: '18%',
      left: '18%',
      right: '18%',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.55)',
      borderRadius: borders.radius.window,
      borderStyle: 'dashed',
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 28,
      paddingBottom: 28,
      paddingTop: 14,
    },
    shutterOuter: {
      width: 68,
      height: 68,
      borderRadius: 34,
      borderWidth: borders.width,
      borderColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.15)',
    },
    shutterInner: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: colors.pink,
    },
    shutterInnerBusy: {
      backgroundColor: colors.muted,
    },
    flipBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: borders.width,
      borderColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.15)',
    },
    flipBtnGhost: {
      width: 44,
      height: 44,
    },
    flipGlyph: {
      fontSize: 20,
      color: colors.white,
    },
    cancelBtn: {
      margin: 12,
      alignSelf: 'center',
    },
  });
}
