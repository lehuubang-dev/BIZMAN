import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ImportScreen from '../screens/ImportScreen';
import ExportScreen from '../screens/ExportScreen';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Import') {
            iconName = focused ? 'enter' : 'enter-outline';
          } else if (route.name === 'Export') {
            iconName = focused ? 'log-out' : 'log-out-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          } else {
            iconName = focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ', headerTitle: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Import"
        component={ImportScreen}
        options={{ tabBarLabel: 'Nhập kho', headerTitle: 'Nhập kho' }}
      />
      <Tab.Screen
        name="Export"
        component={ExportScreen}
        options={{ tabBarLabel: 'Xuất kho', headerTitle: 'Xuất kho' }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ 
          tabBarLabel: 'Tài khoản', 
          headerTitle: 'Tài khoản',
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 20 }}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
