import "react-native-url-polyfill/auto";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import OnboardingScreen from "./screens/OnboardingScreen";
import MasjidSetupScreen from "./screens/MasjidSetupScreen";
import HomeScreen from "./screens/HomeScreen";
import QiblaScreen from "./screens/QiblaScreen";
import QuranScreen from "./screens/QuranScreen";
import SurahDetailScreen from "./screens/SurahDetailScreen";
import JuzDetailScreen from "./screens/JuzDetailScreen";
import PageDetailScreen from "./screens/PageDetailScreen";
import HadithScreen from "./screens/HadithScreen";
import TasbihScreen from "./screens/TasbihScreen";
import DuaScreen from "./screens/DuaScreen";
import DonateScreen from "./screens/DonateScreen";
import SettingsScreen from "./screens/SettingsScreen";
import MasjidsScreen from "./screens/MasjidsScreen";
import HalalFoodScreen from "./screens/HalalFoodScreen";
import MasjidDetailScreen from "./screens/MasjidDetailScreen";
import HalalFoodDetailScreen from "./screens/HalalFoodDetailScreen";
import AskAiScreen from "./screens/AskAiScreen";
import AccountScreen from "./screens/AccountScreen";
import { setupAndroidNotificationChannel } from "./lib/notifications";
import { hasSeenOnboarding, markOnboardingSeen } from "./lib/onboarding";
import { isMasjidSetupDone } from "./lib/homeMasjid";
import { navigationRef } from "./lib/navigationRef";
import { ThemeProvider, useTheme } from "./lib/ThemeContext";
import type { Theme } from "./theme";

export type HomeStackParamList = {
  HomeMain: undefined;
  Qibla: undefined;
  QuranList: undefined;
  SurahDetail: { number: number; englishName: string };
  JuzDetail: { number: number };
  PageDetail: { number: number };
  Hadith: undefined;
  Tasbih: undefined;
  Dua: undefined;
  Donate: undefined;
  Settings: undefined;
  Masjids: undefined;
  HalalFood: undefined;
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
  const theme = useTheme();
  return (
    <HomeStack.Navigator screenOptions={headerOptions(theme)}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Qibla" component={QiblaScreen} options={{ title: "Qibla Direction" }} />
      <HomeStack.Screen name="QuranList" component={QuranScreen} options={{ title: "Qur'an" }} />
      <HomeStack.Screen
        name="SurahDetail"
        component={SurahDetailScreen}
        options={({ route }) => ({ title: route.params.englishName })}
      />
      <HomeStack.Screen
        name="JuzDetail"
        component={JuzDetailScreen}
        options={({ route }) => ({ title: `Juz ${route.params.number}` })}
      />
      <HomeStack.Screen
        name="PageDetail"
        component={PageDetailScreen}
        options={({ route }) => ({ title: `Page ${route.params.number}` })}
      />
      <HomeStack.Screen name="Hadith" component={HadithScreen} options={{ title: "Hadith" }} />
      <HomeStack.Screen name="Tasbih" component={TasbihScreen} options={{ title: "Tasbih" }} />
      <HomeStack.Screen name="Dua" component={DuaScreen} options={{ title: "Dua" }} />
      <HomeStack.Screen name="Donate" component={DonateScreen} options={{ title: "Donate" }} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
      <HomeStack.Screen name="Masjids" component={MasjidsScreen} options={{ title: "Masjids" }} />
      <HomeStack.Screen name="HalalFood" component={HalalFoodScreen} options={{ title: "Halal Food" }} />
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

function headerOptions(theme: Theme) {
  return {
    headerStyle: { backgroundColor: theme.colors.cardBg },
    headerTintColor: theme.colors.accent,
    headerTitleStyle: { color: theme.colors.textPrimary, fontWeight: "700" as const },
  };
}

const Tab = createBottomTabNavigator();

function MainTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.cardBg, borderTopColor: theme.colors.border },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Ask"
        component={AskAiScreen}
        options={{
          headerShown: true,
          ...headerOptions(theme),
          title: "Ask",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          headerShown: true,
          ...headerOptions(theme),
          title: "Account",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const RootStack = createNativeStackNavigator<RootStackParamList>();

function AppInner() {
  const theme = useTheme();
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.pageBg }}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  const navTheme = {
    ...(theme.mode === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.mode === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.pageBg,
      card: theme.colors.cardBg,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      primary: theme.colors.accent,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
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

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
