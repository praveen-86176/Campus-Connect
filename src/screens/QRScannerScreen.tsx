import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useCampusData } from '../context/CampusDataContext';
import { Colors } from '../constants/colors';

export const QRScannerScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const { rsvps, getEventById, upsertRsvp } = useCampusData();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (hasScanned) {
      return;
    }
    setHasScanned(true);
    try {
      const parsed = JSON.parse(data as string);
      const eventId = parsed?.eventId;
      const userId = parsed?.userId;
      const timestamp = parsed?.timestamp;

      if (!eventId || !userId || !timestamp) {
        Alert.alert('Invalid QR', 'Missing required fields.');
        setHasScanned(false);
        return;
      }

      const event = getEventById(eventId);
      if (!event) {
        Alert.alert('Unknown event', 'This event does not exist.');
        setHasScanned(false);
        return;
      }

      const existing = rsvps.find((r) => r.eventId === eventId && r.userId === userId);
      if (!existing) {
        Alert.alert('Not on RSVP list', 'No RSVP found for this QR.');
        setHasScanned(false);
        return;
      }

      const updated = { ...existing, attended: true };
      await upsertRsvp(updated);
      Alert.alert('Attendance marked', 'Check-in recorded.', [
        { text: 'Scan Again', onPress: () => setHasScanned(false) },
      ]);
    } catch (e) {
      Alert.alert('Invalid QR', 'Unable to decode this QR.');
      setHasScanned(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>Camera access is required to scan QR codes.</Text>
        <Text style={styles.permissionButton} onPress={requestPermission}>
          Grant Permission
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Align the QR code within the frame</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  overlay: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionButton: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
