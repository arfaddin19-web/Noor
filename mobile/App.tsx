import "react-native-url-polyfill/auto";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";

import HomeScreen from "./screens/HomeScreen";
import QiblaScreen from "./screens/QiblaScreen";
import QuranScreen from "./screens/QuranScreen";
import SurahDetailScreen from "./screens/SurahDetailScreen";
import HadithScreen from "./screens/HadithScreen";
import NearbyScreen from "./screens/NearbyScreen";
import AskAiScreen from "./screens/AskAiScreen";
import AccountScreen from "./screens/AccountScreen";
import { setupAndroidNotificationChannel } from "./lib/notifications";

export type QuranStackParamList = {
  QuranList: undefined;
  SurahDetail: { number: number; englishName: string };
};

const QuranStack = createNativeStackNavigator<QuranStackParamList>();

function QuranStackNavigator() {
  return (
    <QuranStack.Navigator>
      <QuranStack.Screen name="QuranList" component={QuranScreen} options={{ title: "Qur'an" }} />
      <QuranStack.Screen
        name="SurahDetail"
        component={SurahDetailScreen}
        options={({ route }) => ({ title: route.params.englishName })}
      />
    </QuranStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}

export default function App() {
  useEffect(() => {
    setupAndroidNotificationChannel();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator screenOptions={{ headerShown: true }}>
        <Tab.Screen
          name="Prayer Times"
          component={HomeScreen}
          options={{ tabBarIcon: () => <TabIcon emoji="🕌" /> }}
        />
        <Tab.Screen
          name="Qibla"
          component={QiblaScreen}
          options={{ tabBarIcon: () => <TabIcon emoji="🧭" /> }}
        />
        <Tab.Screen
          name="Qur'an"
          component={QuranStackNavigator}
          options={{ headerShown: false, tabBarIcon: () => <TabIcon emoji="📖" /> }}
        />
        <Tab.Screen
          name="Hadith"
          component={HadithScreen}
          options={{ tabBarIcon: () => <TabIcon emoji="📜" /> }}
        />
        <Tab.Screen
          name="Nearby"
          component={NearbyScreen}
          options={{ tabBarIcon: () => <TabIcon emoji="📍" /> }}
        />
        <Tab.Screen
          name="Ask"
          component={AskAiScreen}
          options={{ tabBarIcon: () => <TabIcon emoji="💬" /> }}
        />
        <Tab.Screen
          name="Account"
          component={AccountScreen}
          options={{ tabBarIcon: () => <TabIcon emoji="👤" /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
