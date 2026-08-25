import "react-native-url-polyfill/auto";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import OnboardingScreen from "./screens/OnboardingScreen";
import MasjidSetupScreen from "./screens/MasjidSetupScreen";
import HomeScreen from "./screens/HomeScreen";
import QiblaScreen from "./screens/QiblaScreen";
import QuranScreen from "./screens/QuranScreen";
import SurahDetailScreen from "./screens/SurahDetailScreen";
import HadithScreen from "./screens/HadithScreen";
import NearbyScreen from "./screens/NearbyScreen";
import MasjidDetailScreen from "./screens/MasjidDetailScreen";
import HalalFoodDetailScreen from "./screens/HalalFoodDetailScreen";
import AskAiScreen from "./screens/AskAiScreen";
import AccountScreen from "./screens/AccountScreen";
import { setupAndroidNotificationChannel } from "./lib/notifications";
import { hasSeenOnboarding, markOnboardingSeen } from "./lib/onboarding";
import { isMasjidSetupDone } from "./lib/homeMasjid";
import { navigationRef } from "./lib/navigationRef";
import { theme } from "./theme";

export type HomeStackParamList = {
  HomeMain: undefined;
  Qibla: undefined;
  QuranList: undefined;
  SurahDetail: { number: number; englishName: string };
  Hadith: undefined;
  Nearby: undefined;
  MasjidDetail: { id: string };
  HalalFoodDetail: { id: string };
};

export type RootStackParamList = {
  Onboarding: undefined;
  MasjidSetup: { standalone?: boolean } | undefined;
  Main: undefined;
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
      <HomeStack.Screen
        name="HalalFoodDetail"
        component={HalalFoodDetailScreen}
        options={{ title: "Halal Food" }}
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

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>("Main");

  useEffect(() => {
    setupAndroidNotificationChannel();
    (async () => {
      const [seenOnboarding, masjidDone] = await Promise.all([
        hasSeenOnboarding(),
        isMasjidSetupDone(),
      ]);
      if (!seenOnboarding) setInitialRoute("Onboarding");
      else if (!masjidDone) setInitialRoute("MasjidSetup");
      else setInitialRoute("Main");
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <RootStack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name="Onboarding">
          {({ navigation }) => (
            <OnboardingScreen
              onDone={() => {
                markOnboardingSeen();
                navigation.replace("MasjidSetup", { standalone: true });
              }}
            />
          )}
        </RootStack.Screen>
        <RootStack.Screen
          name="MasjidSetup"
          component={MasjidSetupScreen}
          initialParams={{ standalone: true }}
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTintColor: theme.colors.textOnDark,
            title: "",
          }}
        />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
