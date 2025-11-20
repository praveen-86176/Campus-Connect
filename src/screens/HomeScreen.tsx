import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { mockUser } from '../constants/mockData';
import { useCampusData } from '../context/CampusDataContext';
import { QuickActionButton } from '../components/QuickActionButton';
import { EventCard } from '../components/EventCard';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { MainTabsParamList, RootStackParamList } from '../navigation/types';
import { Event } from '../types';

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const { events } = useCampusData();

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>Welcome back,</Text>
      <Text style={styles.name}>{mockUser.name}</Text>

      <View style={styles.quickActions}>
        <QuickActionButton label="Browse Clubs" onPress={() => navigation.navigate('MainTabs', { screen: 'Clubs' })} />
        <QuickActionButton label="My RSVPs" onPress={() => navigation.navigate('MainTabs', { screen: 'MyRsvps' })} />
      </View>

      <SectionHeader title="Upcoming Events" subtitle="Next 3 on your radar" />

      {upcomingEvents.length === 0 ? (
        <EmptyState message="No upcoming events yet." />
      ) : (
        upcomingEvents.map((event) => (
          <EventCard key={event.id} event={event} onPress={handleEventPress} />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.background,
  },
  welcome: {
    color: Colors.mutedText,
    fontSize: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 28,
  },
});
