import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

type UpcomingTicket = {
    id: string;
    title: string;
    dateTime: string;
    status?: 'confirmed' | 'waitlist';
};

type UpcomingTicketsListProps = {
    tickets: UpcomingTicket[];
    onTicketPress?: (ticketId: string) => void;
};

export const UpcomingTicketsList: React.FC<UpcomingTicketsListProps> = ({ tickets, onTicketPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Upcoming Tickets</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tickets.length} events</Text>
                </View>
            </View>

            {tickets.map((ticket) => (
                <TouchableOpacity
                    key={ticket.id}
                    style={styles.ticketRow}
                    onPress={() => onTicketPress?.(ticket.id)}
                >
                    <View style={styles.ticketInfo}>
                        <Text style={styles.ticketTitle}>{ticket.title}</Text>
                        <Text style={styles.ticketDateTime}>{ticket.dateTime}</Text>
                    </View>
                    {ticket.status === 'waitlist' ? (
                        <View style={styles.waitlistBadge}>
                            <Text style={styles.waitlistText}>Waitlist</Text>
                        </View>
                    ) : (
                        <Ionicons name="qr-code-outline" size={24} color={Colors.mutedText} />
                    )}
                </TouchableOpacity>
            ))}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    badge: {
        backgroundColor: Colors.background,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.mutedText,
    },
    ticketRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    ticketInfo: {
        flex: 1,
    },
    ticketTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    ticketDateTime: {
        fontSize: 13,
        color: Colors.mutedText,
    },
    waitlistBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    waitlistText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F59E0B',
    },
});
