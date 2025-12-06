import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

type Props = {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
};

export const SearchBar: React.FC<Props> = ({
    placeholder = 'Search events, clubs...',
    value = '',
    onChangeText
}) => {
    const { isDark } = useTheme();
    const colors = getColors(isDark);

    return (
        <View style={[styles.container, { backgroundColor: colors.searchBg }]}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.icon} />
            <TextInput
                style={[styles.input, { color: colors.textLight }]}
                placeholder={placeholder}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 24,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
});

