import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList, AdminStackParamList } from '../navigation/types';
import { canMarkAttendance } from '../utils/roleUtils';

type QRCodeData = {
  rsvpId?: string; // Optional for backward compatibility
  eventId: string;
  userId: string;
  timestamp?: string;
};

type RouteProps = RouteProp<RootStackParamList, 'QRScanner'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { user } = useAuth();
  const { markCheckIn, markCheckOut, getEventById, getUserAttendanceStatus, rsvps } = useCampusData();
  
  const eventId = route.params?.eventId;
  const targetEvent = eventId ? getEventById(eventId) : null;
  const isAdminOrOrganizer = canMarkAttendance(user);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [lastScannedUser, setLastScannedUser] = useState<string | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
    
    // Check permissions for admin/organizer - only admins/organizers can scan QR codes
    if (!isAdminOrOrganizer) {
      Alert.alert(
        'Access Denied',
        'You do not have permission to scan QR codes for attendance. Only administrators and event organizers can scan QR codes.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [permission, requestPermission, isAdminOrOrganizer, navigation]);

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

      // STRICT EVENT MATCHING: If scanning for a specific event, QR code MUST match that event
      if (eventId && qrData.eventId !== eventId) {
        Alert.alert(
          'Wrong Event QR Code',
          `This QR code is for a different event. You are scanning for "${targetEvent?.title || 'this event'}". Please scan the correct QR code that matches this event.`,
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

      // Check if user has RSVP'd - use RSVP ID if available, otherwise find by eventId and userId
      let userRsvp = qrData.rsvpId 
        ? rsvps.find(r => r.id === qrData.rsvpId)
        : rsvps.find(r => r.eventId === qrData.eventId && r.userId === qrData.userId);
      
      if (!userRsvp) {
        Alert.alert(
          'No RSVP Found',
          'This user has not RSVP\'d to this event. Please RSVP first.',
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

      // Check current attendance status
      const currentStatus = getUserAttendanceStatus(qrData.eventId, qrData.userId);
      setLastScannedUser(qrData.userId);

      // Determine action based on current status - automatic check-in/check-out
      if (currentStatus === 'absent') {
        // First scan - automatically mark check-in
        await markCheckIn(qrData.eventId, qrData.userId);
        
        Alert.alert(
          'Check-in Successful! ✅',
          `You are checked in for "${event.title}".\n\n${userRsvp.userName} has been successfully checked in.`,
          [
            { 
              text: 'Scan Another', 
              onPress: () => {
                setHasScanned(false);
                setIsProcessing(false);
                setScannedData(null);
                setLastScannedUser(null);
              }
            },
            { 
              text: 'Done', 
              style: 'default',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else if (currentStatus === 'checked_in') {
        // Already checked in - automatically check out on second scan
        try {
          await markCheckOut(qrData.eventId, qrData.userId);
          
          Alert.alert(
            'Check-out Successful! ✅',
            `You are checked out from "${event.title}".\n\n${userRsvp.userName} has been successfully checked out.`,
            [
              { 
                text: 'Scan Another', 
                onPress: () => {
                  setHasScanned(false);
                  setIsProcessing(false);
                  setScannedData(null);
                  setLastScannedUser(null);
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
          Alert.alert(
            'Check-out Failed',
            error.message || 'Cannot check out without checking in first. Please check in before checking out.',
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
        }
      } else if (currentStatus === 'checked_out') {
        // Already checked out - inform admin
        Alert.alert(
          'Already Checked Out',
          `${userRsvp.userName} has already been checked out from "${event.title}".`,
          [
            { 
              text: 'Scan Another', 
              onPress: () => {
                setHasScanned(false);
                setIsProcessing(false);
                setScannedData(null);
                setLastScannedUser(null);
              }
            },
            { 
              text: 'OK',
              style: 'cancel',
              onPress: () => {
                setHasScanned(false);
                setIsProcessing(false);
                setScannedData(null);
                setLastScannedUser(null);
              }
            }
          ]
        );
      }
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
          {targetEvent && (
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle} numberOfLines={1}>{targetEvent.title}</Text>
              <Text style={styles.eventSubtitle}>Scan QR codes for this event</Text>
            </View>
          )}
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
  eventInfo: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventSubtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
});
