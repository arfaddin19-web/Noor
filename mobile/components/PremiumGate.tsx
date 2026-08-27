import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import { useRegistration } from "../lib/useRegistration";
import { isPremium } from "../lib/premium";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

/** Wraps a premium-only feature: renders `children` if this device is
 *  registered and marked premium, otherwise a locked placeholder pointing
 *  to the Premium screen. No feature actually uses this yet — it's
 *  scaffolding, ready for when audio recitation / extra Adhan sounds /
 *  etc. are built, so they can be gated with one wrapper instead of
 *  scattering `isPremium()` checks everywhere. */
export default function PremiumGate({
  featureName,
  children,
}: {
  featureName: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { registration } = useRegistration();

  if (isPremium(registration)) return <>{children}</>;

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="star" size={22} color={theme.colors.gold} />
      </View>
      <Text style={styles.title}>{featureName} is a Noor Premium feature</Text>
      <Text style={styles.subtitle}>Unlock this and more with Noor Premium.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Premium")}>
        <Text style={styles.buttonText}>Learn more</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    wrap: {
      alignItems: "center",
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.lg,
      gap: 6,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.pageBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    title: { fontSize: 14, fontWeight: "700", color: theme.colors.textPrimary, textAlign: "center" },
    subtitle: { fontSize: 12, color: theme.colors.textMuted, textAlign: "center" },
    button: {
      marginTop: 10,
      backgroundColor: theme.colors.gold,
      borderRadius: theme.radius.pill,
      paddingHorizontal: 18,
      paddingVertical: 9,
    },
    buttonText: { color: "#3a2a00", fontWeight: "700", fontSize: 13 },
  });
}
