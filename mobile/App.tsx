import "react-native-url-polyfill/auto";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import OnboardingScreen from "./screens/OnboardingScreen";
import HomeScreen from "./screens/HomeScreen";
import QiblaScreen from "./screens/QiblaScreen";
import QuranScreen from "./screens/QuranScreen";
import SurahDetailScreen from "./screens/SurahDetailScreen";
import HadithScreen from "./screens/HadithScreen";
import NearbyScreen from "./screens/NearbyScreen";
import MasjidDetailScreen from "./screens/MasjidDetailScreen";
import AskAiScreen from "./screens/AskAiScreen";
import AccountScreen from "./screens/AccountScreen";
import { setupAndroidNotificationChannel } from "./lib/notifications";
import { hasSeenOnboarding, markOnboardingSeen } from "./lib/onboarding";
import { theme } from "./theme";

export type HomeStackParamList = {
  HomeMain: undefined;
  Qibla: undefined;
  QuranList: undefined;
  SurahDetail: { number: number; englishName: string };
  Hadith: undefined;
  Nearby: undefined;
  MasjidDetail: { id: string };
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Qibla" component={QiblaScreen} options={{ title: "Qibla Direction" }} />
      <HomeStack.Screen name="QuranList" component={QuranScreen} options={{ title: "Qur'an" }} />
      <HomeStack.Screen
        name="SurahDetail"
        component={SurahDetailScreen}
        options={({ route }) => ({ title: route.params.englishName })}
      />
      <HomeStack.Screen name="Hadith" component={HadithScreen} options={{ title: "Hadith" }} />
      <HomeStack.Screen name="Nearby" component={NearbyScreen} options={{ title: "Nearby" }} />
      <HomeStack.Screen
        name="MasjidDetail"
        component={MasjidDetailScreen}
        options={{ title: "Masjid" }}
      />
    </HomeStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ tabBarIcon: () => <TabIcon emoji="🏠" /> }}
      />
      <Tab.Screen
        name="Ask"
        component={AskAiScreen}
        options={{ headerShown: true, tabBarIcon: () => <TabIcon emoji="💬" /> }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ headerShown: true, tabBarIcon: () => <TabIcon emoji="👤" /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setupAndroidNotificationChannel();
    hasSeenOnboarding().then((seen) => {
      setShowOnboarding(!seen);
      setCheckingOnboarding(false);
    });
  }, []);

  if (checkingOnboarding) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onDone={() => {
          markOnboardingSeen();
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <MainTabs />
    </NavigationContainer>
  );
}
