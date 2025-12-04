import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';

type QRCodeData = {
  eventId: string;
  userId: string;
  timestamp?: string;
};

export const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { user } = useAuth();
  const { markCheckIn, getEventById } = useCampusData();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const validateQRCode = (data: string): QRCodeData | null => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.eventId && parsed.userId) {
        return parsed as QRCodeData;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (hasScanned || isProcessing) {
      return;
    }

    setHasScanned(true);
    setScannedData(data);
    setIsProcessing(true);

    try {
      // Validate QR code format
      const qrData = validateQRCode(data);
      
      if (!qrData) {
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not a valid event pass. Please scan a valid event QR code.',
          [
            { 
              text: 'Try Again', 
              onPress: () => {
                setHasScanned(false);
                setIsProcessing(false);
                setScannedData(null);
              }
            }
          ]
        );
        return;
      }

      // Check if the QR code is for the current user (if scanning own QR)
      // Or if admin/organizer is scanning someone else's QR
      const event = getEventById(qrData.eventId);
      
      if (!event) {
        Alert.alert(
          'Event Not Found',
          'The event associated with this QR code could not be found.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                setHasScanned(false);
                setIsProcessing(false);
                setScannedData(null);
              }
            }
          ]
        );
        return;
      }

      // Mark check-in
      await markCheckIn(qrData.eventId, qrData.userId);
      
      // Get user info for display
      const scannedUserName = qrData.userId === user?.uid ? 'You' : 'The user';
      const verb = qrData.userId === user?.uid ? 'have' : 'has';
      
      Alert.alert(
        'Check-in Successful! ✅',
        `${scannedUserName} ${verb} been checked in to "${event.title}".`,
        [
          { 
            text: 'Scan Another', 
            onPress: () => {
              setHasScanned(false);
              setIsProcessing(false);
              setScannedData(null);
            }
          },
          { 
            text: 'Done', 
            style: 'default',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error processing QR code:', error);
      Alert.alert(
        'Check-in Failed',
        error.message || 'Failed to process check-in. Please try again.',
        [
          { 
            text: 'Try Again', 
            onPress: () => {
              setHasScanned(false);
              setIsProcessing(false);
              setScannedData(null);
            }
          }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Requesting camera permissions...</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.centered}>
          <Ionicons name="camera-outline" size={64} color={colors.mutedText} />
          <Text style={[styles.permissionText, { color: colors.text }]}>
            Camera access is required to scan QR codes for event check-in.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      
      {/* Overlay with scanning frame */}
      <SafeAreaView style={styles.overlayContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Scanning frame */}
        <View style={styles.scanFrameContainer}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.instructionsText}>Processing check-in...</Text>
            </View>
          ) : hasScanned ? (
            <View style={styles.scannedContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
              <Text style={styles.instructionsText}>QR Code Scanned!</Text>
            </View>
          ) : (
            <View style={styles.instructionsView}>
              <Text style={styles.instructionsText}>
                Position the QR code within the frame
              </Text>
              <Text style={styles.instructionsSubtext}>
                Make sure the QR code is clear and well-lit
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  instructionsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  instructionsView: {
    alignItems: 'center',
  },
  processingContainer: {
    alignItems: 'center',
  },
  scannedContainer: {
    alignItems: 'center',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  instructionsSubtext: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
