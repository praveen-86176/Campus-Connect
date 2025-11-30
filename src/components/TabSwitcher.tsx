import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

type TabSwitcherProps = {
    tabs: string[];
    activeTab: number;
    onTabChange: (index: number) => void;
};

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <View style={styles.container}>
            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tab,
                        activeTab === index && styles.activeTab,
                    ]}
                    onPress={() => onTabChange(index)}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === index && styles.activeTabText,
                        ]}
                    >
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.card,
        alignItems: 'center',
    },
    activeTab: {
        borderColor: Colors.primary,
        backgroundColor: Colors.card,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.mutedText,
    },
    activeTabText: {
        color: Colors.text,
    },
});
