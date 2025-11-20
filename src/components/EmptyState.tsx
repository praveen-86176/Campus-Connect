import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

type Props = {
  message: string;
};

export const EmptyState: React.FC<Props> = ({ message }) => (
  <View style={styles.container}>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  message: {
    color: Colors.mutedText,
  },
});
