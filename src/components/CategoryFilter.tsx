import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

type Category = 'All Events' | 'Tech' | 'Cultural' | 'Sports' | 'Arts';

const categories: Category[] = ['All Events', 'Tech', 'Cultural', 'Sports', 'Arts'];

type Props = {
    onCategoryChange?: (category: Category) => void;
};

export const CategoryFilter: React.FC<Props> = ({ onCategoryChange }) => {
    const [selectedCategory, setSelectedCategory] = useState<Category>('All Events');
    const { isDark } = useTheme();
    const colors = getColors(isDark);

    const handlePress = (category: Category) => {
        setSelectedCategory(category);
        onCategoryChange?.(category);
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {categories.map((category) => (
                <TouchableOpacity
                    key={category}
                    style={[
                        styles.chip,
                        { backgroundColor: selectedCategory === category ? colors.primary : colors.card, borderColor: selectedCategory === category ? colors.primary : colors.border },
                    ]}
                    onPress={() => handlePress(category)}
                >
                    <Text
                        style={[
                            styles.chipText,
                            { color: selectedCategory === category ? colors.textLight : colors.text },
                        ]}
                    >
                        {category}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    contentContainer: {
        paddingRight: 20,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

