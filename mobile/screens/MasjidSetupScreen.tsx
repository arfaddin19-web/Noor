import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { supabase } from "../lib/supabase";
import { Masjid } from "../lib/types";
import { getHomeCity, getHomeMasjidId, saveHomeMasjid } from "../lib/homeMasjid";
import SelectModal, { SelectOption } from "../components/SelectModal";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "MasjidSetup">;
type Route = RouteProp<RootStackParamList, "MasjidSetup">;

export default function MasjidSetupScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const standalone = params?.standalone ?? false;

  const [loading, setLoading] = useState(true);
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [city, setCity] = useState<SelectOption | null>(null);
  const [masjid, setMasjid] = useState<SelectOption | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data }, prevCity, prevMasjidId] = await Promise.all([
        supabase.from("masjids").select("*").eq("is_approved", true),
        getHomeCity(),
        getHomeMasjidId(),
      ]);
      const list = (data as Masjid[]) ?? [];
      setMasjids(list);
      if (prevCity) setCity({ key: prevCity, label: prevCity });
      if (prevMasjidId) {
        const m = list.find((x) => x.id === prevMasjidId);
        if (m) setMasjid({ key: m.id, label: m.name, sublabel: m.address ?? undefined });
      }
      setLoading(false);
    })();
  }, []);

  const cityOptions: SelectOption[] = Array.from(
    new Set(masjids.map((m) => m.city).filter((c): c is string => !!c))
  )
    .sort()
    .map((c) => ({ key: c, label: c }));

  const masjidOptions: SelectOption[] = masjids
    .filter((m) => m.city === city?.key)
    .map((m) => ({ key: m.id, label: m.name, sublabel: m.address ?? undefined }));

  function finish(cityKey: string | null, masjidKey: string | null) {
    if (standalone) {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } else {
      navigation.goBack();
    }
    // Fire-and-forget: the screen is already gone by the time this resolves,
    // and both destinations re-read this on their own next load.
    saveHomeMasjid(cityKey, masjidKey);
  }

  return (
    <LinearGradient
      colors={[theme.colors.skyTop, theme.colors.skyMid, theme.colors.skyBottom]}
      style={styles.flex}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Find your masjid</Text>
        <Text style={styles.subtitle}>
          Pick your district and masjid, and we'll show its Adhan and Jamat times right on
          your Home screen. You can change this anytime from Account.
        </Text>

        {loading ? (
          <ActivityIndicator color="white" style={{ marginTop: 30 }} />
        ) : (
          <View style={{ gap: 20, marginTop: 30, width: "100%" }}>
            <SelectModal
              label="District / City"
              placeholder="Select a district"
              value={city}
              options={cityOptions}
              onSelect={(o) => {
                setCity(o);
                setMasjid(null);
              }}
            />
            <SelectModal
              label="Masjid"
              placeholder={city ? "Select a masjid" : "Choose a district first"}
              value={masjid}
              options={masjidOptions}
              onSelect={setMasjid}
              disabled={!city}
            />
            {city && masjidOptions.length === 0 && (
              <Text style={styles.hint}>
                No masjids listed in {city.label} yet — ask your masjid to get added from the
                admin dashboard, or skip for now.
              </Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cta, !masjid && styles.ctaDisabled]}
            disabled={!masjid}
            onPress={() => finish(city?.key ?? null, masjid?.key ?? null)}
          >
            <Text style={styles.ctaText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => finish(null, null)} style={{ marginTop: 14 }}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 80, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700", color: theme.colors.textOnDark, textAlign: "center" },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textOnDarkMuted,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  hint: { color: theme.colors.gold, fontSize: 12, textAlign: "center", lineHeight: 18 },
  footer: { marginTop: "auto", marginBottom: 40, alignItems: "center", width: "100%" },
  cta: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 15,
    borderRadius: theme.radius.pill,
    width: "100%",
    alignItems: "center",
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: "white", fontWeight: "700", fontSize: 15 },
  skipText: { color: theme.colors.textOnDarkMuted, fontWeight: "600", fontSize: 13 },
  });
}
