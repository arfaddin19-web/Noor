import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import ScreenBackground from "../components/ScreenBackground";
import { HADITH_BOOKS } from "../lib/hadithBooks";
import { getScannedBooks, type ScannedBook } from "../lib/scannedBooks";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Nav = NativeStackNavigationProp<HomeStackParamList, "BooksHadith">;

// A single shape both the static hadith collections and the dynamically
// fetched scanned books (e.g. Muntakhab Ahadith, and any future book of
// that kind) render as, so the list doesn't need to special-case them.
type ListItem =
  | { kind: "hadith"; key: string; name: string; available: boolean; unavailableNote?: string }
  | { kind: "bahishti"; key: "bahishti"; name: string }
  | { kind: "scanned"; key: string; name: string; slug: string; pageCount: number };

export default function BooksHadithScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [scannedBooks, setScannedBooks] = useState<ScannedBook[]>([]);

  useEffect(() => {
    getScannedBooks().then(setScannedBooks);
  }, []);

  const data: ListItem[] = useMemo(() => {
    const items: ListItem[] = HADITH_BOOKS.map((b) =>
      b.key === "bahishti"
        ? { kind: "bahishti", key: "bahishti", name: b.name }
        : { kind: "hadith", key: b.key, name: b.name, available: b.available, unavailableNote: b.unavailableNote }
    );
    // Scanned books (fetched from Supabase, so future books show up here
    // automatically without any app update) are appended after the fixed
    // collections above.
    for (const sb of scannedBooks) {
      items.push({ kind: "scanned", key: `scanned:${sb.slug}`, name: sb.title, slug: sb.slug, pageCount: sb.page_count });
    }
    return items;
  }, [scannedBooks]);

  return (
    <ScreenBackground>
      <FlatList
        style={styles.page}
        contentContainerStyle={styles.listContent}
        data={data}
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
                if (item.kind === "bahishti") {
                  navigation.navigate("BahishtiZewar");
                } else if (item.kind === "scanned") {
                  navigation.navigate("ScannedBook", {
                    slug: item.slug,
                    title: item.name,
                    pageCount: item.pageCount,
                  });
                } else if (item.available) {
                  navigation.navigate("HadithBook", { key: item.key });
                } else {
                  setExpanded((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                }
              }}
            >
              <View style={styles.rowIconWrap}>
                <Ionicons
                  name={item.kind === "hadith" && !item.available ? "alert-circle-outline" : "book-outline"}
                  size={18}
                  color={item.kind === "hadith" && !item.available ? theme.colors.textMuted : theme.colors.accent}
                />
              </View>
              <Text style={styles.rowLabel}>{item.name}</Text>
              <Ionicons
                name={
                  item.kind === "hadith" && !item.available
                    ? expanded[item.key]
                      ? "chevron-up"
                      : "chevron-down"
                    : "chevron-forward"
                }
                size={16}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
            {item.kind === "hadith" && !item.available && expanded[item.key] && (
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
