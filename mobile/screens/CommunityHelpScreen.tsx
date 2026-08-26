import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenBackground from "../components/ScreenBackground";
import { supabase } from "../lib/supabase";
import { CommunityOrg } from "../lib/types";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

export default function CommunityHelpScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [orgs, setOrgs] = useState<CommunityOrg[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("community_orgs")
      .select("*")
      .then(({ data, error: err }) => {
        if (err) setError("Couldn't load the directory. Check your connection.");
        setOrgs((data as CommunityOrg[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? orgs.filter(
          (o) =>
            o.city?.toLowerCase().includes(q) ||
            o.name.toLowerCase().includes(q) ||
            o.contact_person?.toLowerCase().includes(q)
        )
      : orgs;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [orgs, query]);

  return (
    <ScreenBackground style={styles.page}>
      <Text style={styles.intro}>
        Masjid-affiliated social-work organizations. If you're new to a city or in
        difficulty, reach out directly.
      </Text>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by city or organization…"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.center}>
          <Text style={styles.muted}>{error}</Text>
        </View>
      )}
      {!error && loading && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      )}
      {!error && !loading && (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.muted}>
              {query ? `No organizations found for "${query}".` : "No organizations listed yet."}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, theme.cardShadow]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="hand-heart" size={20} color={theme.colors.accent} />
                <Text style={styles.cardTitle}>{item.name}</Text>
              </View>
              {item.city && <Text style={styles.cardSubtitle}>{item.city}</Text>}
              {item.description && <Text style={styles.description}>{item.description}</Text>}
              {(item.contact_person || item.designation) && (
                <View style={styles.contactRow}>
                  <Ionicons name="person-outline" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.contactText}>
                    {[item.contact_person, item.designation].filter(Boolean).join(" — ")}
                  </Text>
                </View>
              )}
              {item.phone && (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => Linking.openURL(`tel:${item.phone}`)}
                >
                  <Ionicons name="call" size={15} color="white" />
                  <Text style={styles.callButtonText}>Call {item.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </ScreenBackground>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: "transparent" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    muted: { color: theme.colors.textMuted, textAlign: "center", marginTop: 40 },
    intro: {
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 18,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.pill,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.sm,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: { flex: 1, fontSize: 14, color: theme.colors.textPrimary, padding: 0 },
    listContent: { padding: theme.spacing.md },
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    cardTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary, flexShrink: 1 },
    cardSubtitle: { fontSize: 12, color: theme.colors.accent, fontWeight: "700", marginTop: 4, marginLeft: 28 },
    description: { fontSize: 13, color: theme.colors.textMuted, marginTop: 8, lineHeight: 19 },
    contactRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
    contactText: { fontSize: 12, color: theme.colors.textMuted },
    callButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.pill,
      paddingVertical: 9,
      marginTop: 12,
    },
    callButtonText: { color: "white", fontWeight: "700", fontSize: 13 },
  });
}
