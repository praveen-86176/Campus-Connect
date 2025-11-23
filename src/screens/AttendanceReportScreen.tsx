import { RouteProp, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';

type RouteProps = RouteProp<RootStackParamList, 'AttendanceReport'>;

export const AttendanceReportScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { getAttendanceForEvent } = useCampusData();
  const records = getAttendanceForEvent(route.params.eventId);

  const toCsv = () => {
    const header = 'userId,eventId,checkInAt,checkOutAt';
    const rows = records.map((r) => `${r.userId},${r.eventId},${r.checkInAt ?? ''},${r.checkOutAt ?? ''}`);
    return [header, ...rows].join('\n');
  };

  const handleExport = async () => {
    const csv = toCsv();
    if (Platform.OS === 'web' && navigator.clipboard) {
      await navigator.clipboard.writeText(csv);
      Alert.alert('Copied', 'CSV copied to clipboard');
    } else {
      Alert.alert('CSV', csv);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Attendance Report</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportText}>Export CSV</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={records}
        keyExtractor={(item, idx) => `${item.userId}-${idx}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.userId}</Text>
            <Text style={styles.cell}>{item.checkInAt ? 'Checked-in' : '-'}</Text>
            <Text style={styles.cell}>{item.checkOutAt ? 'Checked-out' : '-'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No attendance yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  exportBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  exportText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cell: {
    flex: 1,
    color: Colors.text,
  },
  empty: {
    color: Colors.mutedText,
  },
});