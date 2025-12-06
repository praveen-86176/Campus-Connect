import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCampusData } from '../context/CampusDataContext';

type Category = string; // Can be 'All Events' or any club category

type Props = {
    selectedCategory?: Category;
    onCategoryChange?: (category: Category) => void;
};

export const CategoryFilter: React.FC<Props> = ({ selectedCategory: controlledCategory, onCategoryChange }) => {
    const [internalSelectedCategory, setInternalSelectedCategory] = useState<Category>('All Events');
    const { isDark } = useTheme();
    const colors = getColors(isDark);
    const { clubs } = useCampusData();
    
    // Use controlled category if provided, otherwise use internal state
    const selectedCategory = controlledCategory !== undefined ? controlledCategory : internalSelectedCategory;
    
    // Get all unique club categories dynamically
    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();
        clubs.forEach(club => {
            if (club.category && club.category.trim() !== '') {
                uniqueCategories.add(club.category);
            }
        });
        
        // Convert to array and sort alphabetically
        const categoryArray = Array.from(uniqueCategories).sort();
        
        // Always include "All Events" as the first option
        return ['All Events', ...categoryArray];
    }, [clubs]);

    const handlePress = (category: Category) => {
        if (controlledCategory === undefined) {
            setInternalSelectedCategory(category);
        }
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
        width: '100%',
    },
    contentContainer: {
        paddingRight: 0, // Remove extra padding to prevent overflow
        paddingLeft: 0,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        minWidth: 80,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

