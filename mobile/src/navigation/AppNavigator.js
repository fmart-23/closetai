import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, Platform } from 'react-native';

import Colors from '../constants/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ClosetScreen from '../screens/ClosetScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import OutfitScreen from '../screens/OutfitScreen';
import OutfitResultScreen from '../screens/OutfitResultScreen';

const Tab = createBottomTabNavigator();
const ClosetStack = createStackNavigator();
const OutfitStack = createStackNavigator();

// ---------------------------------------------------------------------------
// Tab bar icon helper — emoji-based, no icon library required
// ---------------------------------------------------------------------------
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={styles.tabIconWrapper}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
        {emoji}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Closet stack: ClosetScreen → ItemDetailScreen
// ---------------------------------------------------------------------------
function ClosetNavigator() {
  return (
    <ClosetStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <ClosetStack.Screen
        name="ClosetList"
        component={ClosetScreen}
        options={{ headerShown: false }}
      />
      <ClosetStack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{ title: 'Item Details' }}
      />
    </ClosetStack.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Outfit stack: OutfitScreen → OutfitResultScreen
// ---------------------------------------------------------------------------
function OutfitNavigator() {
  return (
    <OutfitStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <OutfitStack.Screen
        name="OutfitHome"
        component={OutfitScreen}
        options={{ headerShown: false }}
      />
      <OutfitStack.Screen
        name="OutfitResult"
        component={OutfitResultScreen}
        options={{ title: 'Outfit Suggestion' }}
      />
    </OutfitStack.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Root tab navigator
// ---------------------------------------------------------------------------
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🏠" label="Home" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📷" label="Scan" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Closet"
          component={ClosetNavigator}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="👗" label="Closet" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Outfits"
          component={OutfitNavigator}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="✨" label="Outfits" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabEmojiFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
