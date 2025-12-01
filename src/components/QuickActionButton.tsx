import { TouchableOpacity, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors } from '../constants/colors';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export const QuickActionButton: React.FC<Props> = ({ label, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      },
    }),
  },
  label: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
