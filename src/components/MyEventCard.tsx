import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

type MyEventCardProps = {
    title: string;
    clubName: string;
    date: string;
    time: string;
    location: string;
    status: 'confirmed' | 'attended' | 'missed';
    reminderSet?: boolean;
    onPress?: () => void;
    onCancel?: () => void;
    showActions?: boolean;
};

const MyEventCardComponent: React.FC<MyEventCardProps> = ({
    title,
    clubName,
    date,
    time,
    location,
    status,
    reminderSet = false,
    onPress,
    onCancel,
    showActions = true,
}) => {
    const getStatusBadge = () => {
        switch (status) {
            case 'confirmed':
                return { text: 'Confirmed', color: '#22C55E', bgColor: '#DCFCE7' };
            case 'attended':
                return { text: 'Attended', color: '#22C55E', bgColor: '#DCFCE7' };
            case 'missed':
                return { text: 'Missed', color: '#6B7280', bgColor: '#F3F4F6' };
            default:
                return { text: 'Confirmed', color: '#22C55E', bgColor: '#DCFCE7' };
        }
    };

    const statusBadge = getStatusBadge();

    return (
        <View style={styles.card}>
            {/* Header with Title and Cancel Button */}
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
                {onCancel && status === 'confirmed' && (
                    <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                        <Ionicons name="close" size={20} color={Colors.mutedText} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Club Name */}
            <Text style={styles.clubName}>{clubName}</Text>

            {/* Event Details */}
            <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color={Colors.mutedText} />
                <Text style={styles.detailText}>{date}</Text>
            </View>

            <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color={Colors.mutedText} />
                <Text style={styles.detailText}>{time}</Text>
            </View>

            <View style={styles.detailRow}>
                <Ionicons name="location" size={16} color={Colors.mutedText} />
                <Text style={styles.detailText}>{location}</Text>
            </View>

            {/* Status and Reminder Row */}
            {status === 'confirmed' && (
                <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
                        <Text style={[styles.statusText, { color: statusBadge.color }]}>
                            {statusBadge.text}
                        </Text>
                    </View>
                    <View style={styles.reminderBadge}>
                        <Ionicons name="notifications" size={14} color={Colors.mutedText} />
                        <Text style={styles.reminderText}>Reminder Set</Text>
                    </View>
                    <TouchableOpacity onPress={onPress}>
                        <Ionicons name="chevron-forward" size={20} color={Colors.mutedText} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Status Badge for Past Events */}
            {status !== 'confirmed' && (
                <View style={styles.pastStatusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
                        <Text style={[styles.statusText, { color: statusBadge.color }]}>
                            {statusBadge.text}
                        </Text>
                    </View>
                </View>
            )}

            {/* Action Buttons for Upcoming Events */}
            {showActions && status === 'confirmed' && (
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>View QR Code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Add to Calendar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export const MyEventCard = memo(MyEventCardComponent);

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...Platform.select({
            web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' },
            default: {
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        flex: 1,
        marginRight: 8,
    },
    cancelButton: {
        padding: 4,
    },
    clubName: {
        fontSize: 14,
        color: Colors.primary,
        marginBottom: 12,
        fontWeight: '500',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: Colors.mutedText,
        marginLeft: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    pastStatusRow: {
        marginTop: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    reminderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 'auto',
    },
    reminderText: {
        fontSize: 12,
        color: Colors.mutedText,
        marginLeft: 4,
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
});
