import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCampusData } from '../context/CampusDataContext';
import { InfoBanner } from '../components/InfoBanner';
import { NextEventCard } from '../components/NextEventCard';
import { CheckInInstructions } from '../components/CheckInInstructions';
import { UpcomingTicketsList } from '../components/UpcomingTicketsList';

type TabType = 'myqr' | 'scan';

export const QRScannerScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('myqr');
  const { markCheckIn, markCheckOut, getUserAttendanceStatus, rsvps, getEventById } = useCampusData();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  useEffect(() => {
    if (!permission && activeTab === 'scan') {
      requestPermission();
    }
  }, [permission, requestPermission, activeTab]);

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (hasScanned) {
      return;
    }
    setHasScanned(true);
    try {
      const payload = JSON.parse(data) as { eventId: string; userId: string };
      const status = getUserAttendanceStatus(payload.eventId, payload.userId);
      if (status === 'checked_in') {
        await markCheckOut(payload.userId, payload.eventId);
        Alert.alert('Checked out', 'Goodbye! See you next time.', [{ text: 'OK' }]);
      } else {
        await markCheckIn(payload.userId, payload.eventId);
        Alert.alert('Checked in', 'Welcome to the event!', [{ text: 'OK' }]);
      }
    } catch (e) {
      Alert.alert('Invalid QR', 'Unable to read QR data.', [{ text: 'Scan Again', onPress: () => setHasScanned(false) }]);
    }
  };

  // Mock QR code data
  const qrData = JSON.stringify({
    eventId: '1',
    userId: 'user123',
    ticketId: 'EVT-2025-1128',
  });

  // Mock upcoming tickets
  const upcomingTickets = [
    { id: '1', title: 'Tech Talk: AI Development', dateTime: 'Nov 28, 6:00 PM' },
    { id: '2', title: 'Spring Cultural Night', dateTime: 'Nov 29, 7:30 PM' },
    { id: '3', title: 'Startup Pitch Competition', dateTime: 'Nov 30, 5:00 PM', status: 'waitlist' as const },
  ];

  // Render My QR Code Tab
  const renderMyQRCode = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <InfoBanner message="Show your QR code to the event organizer for quick check-in, or scan event QR codes to RSVP instantly." />

      <NextEventCard
        title="Tech Talk: AI in Modern Development"
        clubName="Computer Science Club"
        dateTime="Nov 28, 2025 • 6:00 PM"
      />

      {/* QR Code Display */}
      <View style={styles.qrContainer}>
        <View style={styles.qrCodeWrapper}>
          <QRCode value={qrData} size={200} />
        </View>
        <Text style={styles.ticketId}>Ticket ID: #EVT-2025-1128</Text>
        <Text style={styles.ticketValidity}>Valid for one-time entry</Text>
      </View>

      <CheckInInstructions />

      <UpcomingTicketsList tickets={upcomingTickets} />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Save to Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Share Ticket</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Render Scan QR Tab
  const renderScanQR = () => {
    if (!permission) {
      return (
        <View style={styles.centered}>
          <Text>Requesting camera permissions...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Text style={[styles.permissionText, { color: colors.text }]}>Camera access is required to scan QR codes.</Text>
          <TouchableOpacity onPress={requestPermission} style={[styles.permissionButtonContainer, { backgroundColor: colors.primary }]}>
            <Text style={styles.permissionButton}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Event Check-in</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedText }]}>Scan QR code or show your ticket</Text>
          </View>
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myqr' && styles.activeTab, { backgroundColor: colors.card, borderColor: activeTab === 'myqr' ? colors.primary : colors.border }]}
            onPress={() => setActiveTab('myqr')}
          >
            <Text style={[styles.tabText, activeTab === 'myqr' && styles.activeTabText, { color: activeTab === 'myqr' ? colors.text : colors.mutedText }]}>
              My QR Code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'scan' && styles.activeTab, { backgroundColor: colors.card, borderColor: activeTab === 'scan' ? colors.primary : colors.border }]}
            onPress={() => setActiveTab('scan')}
          >
            <Text style={[styles.tabText, activeTab === 'scan' && styles.activeTabText, { color: activeTab === 'scan' ? colors.text : colors.mutedText }]}>
              Scan QR
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Tab Content */}
      {activeTab === 'myqr' ? renderMyQRCode() : renderScanQR()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  activeTab: {
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  qrContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 16,
  },
  ticketId: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  ticketValidity: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
    marginBottom: 16,
  },
  permissionButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButton: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

