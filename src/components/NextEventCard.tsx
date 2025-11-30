import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

type NextEventCardProps = {
    title: string;
    clubName: string;
    dateTime: string;
};

export const NextEventCard: React.FC<NextEventCardProps> = ({ title, clubName, dateTime }) => {
    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >
            <View style={styles.badge}>
                <Text style={styles.badgeText}>Next Event</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.clubName}>{clubName}</Text>
            <Text style={styles.dateTime}>{dateTime}</Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
    },
    badge: {
        backgroundColor: Colors.card,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: 8,
    },
    clubName: {
        fontSize: 16,
        color: Colors.textLight,
        opacity: 0.9,
        marginBottom: 4,
    },
    dateTime: {
        fontSize: 15,
        color: Colors.textLight,
        opacity: 0.85,
    },
});
