import { TouchableOpacity, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors } from '../constants/colors';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export const QuickActionButton: React.FC<Props> = ({ label, onPress, style }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    ...Platform.select({
      web: { boxShadow: '0px 6px 12px rgba(0,0,0,0.15)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
    elevation: 3,
  },
  label: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
