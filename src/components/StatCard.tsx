import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

type StatCardProps = {
    value: string | number;
    label: string;
    color?: string;
};

export const StatCard: React.FC<StatCardProps> = ({ value, label, color = Colors.primary }) => {
    return (
        <View style={styles.card}>
            <Text style={[styles.value, { color }]}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    value: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
    },
    label: {
        fontSize: 13,
        color: Colors.mutedText,
        textAlign: 'center',
        fontWeight: '500',
    },
});
