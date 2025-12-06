import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export const CheckInInstructions: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                <Text style={styles.title}>How to Check-in</Text>
            </View>

            <View style={styles.step}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Arrive at the event location on time</Text>
            </View>

            <View style={styles.step}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Show this QR code to the event organizer/admin</Text>
            </View>

            <View style={styles.step}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>They will scan your QR code to mark your attendance</Text>
            </View>
            
            <View style={styles.step}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>You'll see your status update automatically once scanned</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginLeft: 8,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textLight,
    },
    stepText: {
        flex: 1,
        fontSize: 15,
        color: Colors.text,
        lineHeight: 22,
        paddingTop: 3,
    },
});
