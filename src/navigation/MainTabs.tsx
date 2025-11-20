import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { ClubsListScreen } from '../screens/ClubsListScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MyRsvpsScreen } from '../screens/MyRsvpsScreen';
import { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.mutedText,
      tabBarStyle: { backgroundColor: '#fff' },
      tabBarIcon: ({ color, size }) => {
        const iconName =
          route.name === 'Home'
            ? 'home'
            : route.name === 'Clubs'
            ? 'people'
            : 'calendar';
        return <Ionicons name={iconName as never} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Clubs" component={ClubsListScreen} />
    <Tab.Screen name="MyRsvps" component={MyRsvpsScreen} options={{ title: 'My RSVPs' }} />
  </Tab.Navigator>
);
