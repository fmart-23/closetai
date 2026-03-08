/**
 * AppNavigator — Tab + Stack navigation for ClosetAI
 */
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import COLORS from '../constants/colors';
import { TYPOGRAPHY, SPACING } from '../constants/config';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ClosetScreen from '../screens/ClosetScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import OutfitScreen from '../screens/OutfitScreen';
import OutfitResultScreen from '../screens/OutfitResultScreen';
import SavedOutfitsScreen from '../screens/SavedOutfitsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Tab Icon ─────────────────────────────────────────────────────────────────

function TabIcon({ emoji, focused }) {
  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconContainerFocused]}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{emoji}</Text>
    </View>
  );
}

// ─── Closet Stack ─────────────────────────────────────────────────────────────

function ClosetStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTitleStyle: {
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          color: COLORS.textPrimary,
          fontSize: TYPOGRAPHY.fontSize.lg,
        },
        headerTintColor: COLORS.primary,
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="ClosetMain" component={ClosetScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{ title: 'Item Details', headerTransparent: true, headerTitle: '' }}
      />
    </Stack.Navigator>
  );
}

// ─── Outfit Stack ─────────────────────────────────────────────────────────────

function OutfitStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTitleStyle: {
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          color: COLORS.textPrimary,
        },
        headerTintColor: COLORS.primary,
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="OutfitMain" component={OutfitScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="OutfitResult"
        component={OutfitResultScreen}
        options={{ title: 'Outfit Suggestions' }}
      />
      <Stack.Screen
        name="SavedOutfits"
        component={SavedOutfitsScreen}
        options={{ title: 'Saved Outfits' }}
      />
    </Stack.Navigator>
  );
}

// ─── Main Tab Navigator ───────────────────────────────────────────────────────

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textTertiary,
          tabBarLabelStyle: styles.tabLabel,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            tabBarLabel: 'Scan',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📷" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Closet"
          component={ClosetStack}
          options={{
            tabBarLabel: 'Closet',
            tabBarIcon: ({ focused }) => <TabIcon emoji="👗" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Outfits"
          component={OutfitStack}
          options={{
            tabBarLabel: 'Outfits',
            tabBarIcon: ({ focused }) => <TabIcon emoji="✨" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 20,
    paddingTop: SPACING.sm,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tabIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  tabIconContainerFocused: {
    backgroundColor: COLORS.primaryTransparent,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabIconFocused: {
    fontSize: 22,
  },
});
