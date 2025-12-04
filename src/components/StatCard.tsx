import { View, Text, StyleSheet, Platform } from 'react-native';
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
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0, // Prevent overflow
        flex: 1,
        maxWidth: '32%', // Ensure 3 cards fit in a row
        ...Platform.select({
            web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' },
            default: {
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
            },
        }),
    },
    value: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        color: Colors.mutedText,
        textAlign: 'center',
        fontWeight: '500',
        flexWrap: 'wrap',
    },
});
