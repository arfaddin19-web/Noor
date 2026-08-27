import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import ScreenBackground from "../components/ScreenBackground";
import { HADITH_BOOKS } from "../lib/hadithBooks";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Nav = NativeStackNavigationProp<HomeStackParamList, "BooksHadith">;

export default function BooksHadithScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <ScreenBackground>
      <FlatList
        style={styles.page}
        contentContainerStyle={styles.listContent}
        data={HADITH_BOOKS}
        keyExtractor={(b) => b.key}
        ListHeaderComponent={
          <Text style={styles.intro}>
            Full collections, browsable book by book. English throughout, with Urdu
            available as an alternate reading for Bukhari, Muslim, and four more
            collections below.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, theme.cardShadow]}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                if (item.key === "bahishti") {
                  navigation.navigate("BahishtiZewar");
                } else if (item.key === "muntakhab") {
                  navigation.navigate("MuntakhabAhadith");
                } else if (item.available) {
                  navigation.navigate("HadithBook", { key: item.key });
                } else {
                  setExpanded((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                }
              }}
            >
              <View style={styles.rowIconWrap}>
                <Ionicons
                  name={item.available ? "book-outline" : "alert-circle-outline"}
                  size={18}
                  color={item.available ? theme.colors.accent : theme.colors.textMuted}
                />
              </View>
              <Text style={styles.rowLabel}>{item.name}</Text>
              <Ionicons
                name={item.available ? "chevron-forward" : expanded[item.key] ? "chevron-up" : "chevron-down"}
                size={16}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
            {!item.available && expanded[item.key] && (
              <Text style={styles.unavailableNote}>{item.unavailableNote}</Text>
            )}
          </View>
        )}
      />
    </ScreenBackground>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: "transparent" },
    listContent: { padding: theme.spacing.md },
    intro: {
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 18,
      marginBottom: theme.spacing.md,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.sm,
      overflow: "hidden",
    },
    row: { flexDirection: "row", alignItems: "center", gap: 12, padding: theme.spacing.md },
    rowIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.pageBg,
      alignItems: "center",
      justifyContent: "center",
    },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: "700", color: theme.colors.textPrimary },
    unavailableNote: {
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 18,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
  });
}
