import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import InventoryScreen from "../screens/InventoryScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ReportsScreen from "../screens/ReportsScreen";
import AccountScreen from "../screens/AccountScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Inventory") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "Orders") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "Reports") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          } else if (route.name === "Account") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else {
            iconName = focused
              ? "ellipsis-horizontal-circle"
              : "ellipsis-horizontal-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerStyle: {
          backgroundColor: "#2196F3",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Trang chủ",
          headerTitle: "Trang chủ",
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 15, padding: 5 }}>
              <Ionicons name="home" size={27} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: "Hàng hóa",
          headerTitle: "Quản lý hàng hóa",
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 15, padding: 5 }}>
              <Ionicons name="cube" size={27} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: "Đơn hàng",
          headerTitle: "Quản lý đơn hàng",
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 15, padding: 5 }}>
              <Ionicons name="cart" size={27} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: "Báo cáo",
          headerTitle: "Báo cáo",
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 15, padding: 5 }}>
              <Ionicons name="bar-chart" size={27} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: "Tài khoản",
          headerTitle: "Tài khoản",
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 15, padding: 5}}>
              <Ionicons name="person-circle" size={27} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
