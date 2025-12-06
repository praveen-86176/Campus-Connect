import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

type Props = {
  title: string;
  subtitle?: string;
};

export const SectionHeader: React.FC<Props> = ({ title, subtitle }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 4,
    color: Colors.mutedText,
  },
});
