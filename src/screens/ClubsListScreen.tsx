import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, View } from 'react-native';
import { ClubCard } from '../components/ClubCard';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { Colors } from '../constants/colors';
import { useCampusData } from '../context/CampusDataContext';
import { RootStackParamList } from '../navigation/types';
import { Club } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const ClubsListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { clubs } = useCampusData();

  const handleClubPress = (club: Club) => {
    navigation.navigate('EventsList', { clubId: club.id, clubName: club.name });
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Campus Clubs" subtitle="Tap to explore events" />
      <FlatList
        data={clubs}
        keyExtractor={(club) => club.id}
        renderItem={({ item }) => <ClubCard club={item} onPress={handleClubPress} />}
        contentContainerStyle={clubs.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={<EmptyState message="No clubs available." />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
