import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

type InfoBannerProps = {
    message: string;
};

export const InfoBanner: React.FC<InfoBannerProps> = ({ message }) => {
    return (
        <View style={styles.container}>
            <Ionicons name="information-circle" size={24} color={Colors.primary} style={styles.icon} />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    icon: {
        marginRight: 12,
        marginTop: 2,
    },
    text: {
        flex: 1,
        fontSize: 14,
        color: Colors.primary,
        lineHeight: 20,
    },
});
