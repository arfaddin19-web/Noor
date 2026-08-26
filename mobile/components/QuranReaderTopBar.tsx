import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

export default function QuranReaderTopBar({
  leftLabel,
  rightLabel,
}: {
  leftLabel: string;
  rightLabel: string;
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation();

  return (
    <View style={styles.bar}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.pill}>
        <Text style={styles.pillText} numberOfLines={1}>{leftLabel}</Text>
      </View>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate("QuranList" as never)}
      >
        <Ionicons name="home-outline" size={17} color={theme.colors.accent} />
      </TouchableOpacity>
      <View style={styles.pill}>
        <Text style={styles.pillText} numberOfLines={1}>{rightLabel}</Text>
      </View>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 10,
      backgroundColor: theme.colors.cardBg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    pill: {
      flex: 1,
      backgroundColor: theme.colors.pageBg,
      borderRadius: theme.radius.pill,
      paddingHorizontal: 12,
      paddingVertical: 7,
      alignItems: "center",
    },
    pillText: { fontSize: 12, fontWeight: "700", color: theme.colors.textPrimary },
    homeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.pageBg,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
