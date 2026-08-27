import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenBackground from "../components/ScreenBackground";
import { supabase } from "../lib/supabase";
import { useRegistration } from "../lib/useRegistration";
import { clearLocalRegistration, Gender, registerUser, Registration } from "../lib/registration";
import { getHomeCity, getHomeMasjidId } from "../lib/homeMasjid";
import { rootNavigate } from "../lib/navigationRef";
import { isPremium } from "../lib/premium";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

function YourMasjidCard({ theme, styles }: { theme: Theme; styles: ReturnType<typeof makeStyles> }) {
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<string | null>(null);
  const [masjidName, setMasjidName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        setLoading(true);
        const [c, masjidId] = await Promise.all([getHomeCity(), getHomeMasjidId()]);
        if (!mounted) return;
        setCity(c);
        if (masjidId) {
          const { data } = await supabase
            .from("masjids")
            .select("name")
            .eq("id", masjidId)
            .maybeSingle();
          if (mounted) setMasjidName((data as { name: string } | null)?.name ?? null);
        } else {
          setMasjidName(null);
        }
        setLoading(false);
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardIconRow}>
        <Ionicons name="business-outline" size={18} color={theme.colors.accent} />
        <Text style={styles.cardTitle}>Your Masjid</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 8 }} color={theme.colors.accent} />
      ) : (
        <Text style={styles.cardSubtitle}>
          {masjidName ? `${masjidName}${city ? ` — ${city}` : ""}` : "Not set yet"}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => rootNavigate("MasjidSetup", { standalone: false })}
        style={{ marginTop: 4 }}
      >
        <Text style={styles.switchModeText}>{masjidName ? "Change" : "Set your masjid"}</Text>
      </TouchableOpacity>
    </View>
  );
}

function RegisterForm({
  theme,
  styles,
  onRegistered,
}: {
  theme: Theme;
  styles: ReturnType<typeof makeStyles>;
  onRegistered: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);

    if (!fullName.trim()) {
      setError("Enter your full name.");
      return;
    }
    if (!gender) {
      setError("Select male or female.");
      return;
    }

    setLoading(true);
    const result = await registerUser({ fullName, city, gender, occupation });
    setLoading(false);

    if (result.ok) {
      onRegistered();
    } else {
      setError(result.error);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Register</Text>
        <Text style={styles.cardSubtitle}>
          Just your details, no password, no phone number — this helps us know who's using Noor.
        </Text>

        <TextInput
          placeholder="Full name"
          placeholderTextColor={theme.colors.textMuted}
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
        <TextInput
          placeholder="City / District"
          placeholderTextColor={theme.colors.textMuted}
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />
        <TextInput
          placeholder="Occupation"
          placeholderTextColor={theme.colors.textMuted}
          value={occupation}
          onChangeText={setOccupation}
          style={styles.input}
        />
        <View style={styles.genderRow}>
          {(["male", "female"] as Gender[]).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderChip, gender === g && styles.genderChipActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.genderChipText, gender === g && styles.genderChipTextActive]}>
                {g === "male" ? "Male" : "Female"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Register</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function ProfileView({
  registration,
  theme,
  styles,
  onCleared,
}: {
  registration: Registration;
  theme: Theme;
  styles: ReturnType<typeof makeStyles>;
  onCleared: () => void;
}) {
  const navigation = useNavigation<any>();
  const premium = isPremium(registration);

  async function switchProfile() {
    await clearLocalRegistration();
    onCleared();
  }

  return (
    <View>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{registration.full_name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.cardTitle}>{registration.full_name}</Text>
        {(registration.occupation || registration.city) && (
          <Text style={styles.cardSubtitle}>
            {[registration.occupation, registration.city].filter(Boolean).join(" — ")}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.premiumBadge, premium && styles.premiumBadgeActive]}
          onPress={() => navigation.navigate("Home", { screen: "Premium" })}
        >
          <Ionicons name="star" size={13} color={premium ? "#3a2a00" : theme.colors.accent} />
          <Text style={[styles.premiumBadgeText, premium && styles.premiumBadgeTextActive]}>
            {premium ? "Noor Premium" : "Get Noor Premium"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={switchProfile}>
        <Ionicons name="swap-horizontal-outline" size={16} color={theme.colors.danger} />
        <Text style={styles.signOutText}>Not you? Switch profile</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AccountScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { loading, registration, refresh } = useRegistration();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <YourMasjidCard theme={theme} styles={styles} />

        {registration ? (
          <ProfileView registration={registration} theme={theme} styles={styles} onCleared={refresh} />
        ) : (
          <RegisterForm theme={theme} styles={styles} onRegistered={refresh} />
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { padding: theme.spacing.md, backgroundColor: "transparent", flexGrow: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.pageBg },
    card: {
      ...theme.cardShadow,
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      alignItems: "flex-start",
    },
    cardIconRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
    cardTitle: { fontSize: 17, fontWeight: "700", color: theme.colors.textPrimary },
    cardSubtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4, marginBottom: 14 },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    avatarText: { color: "white", fontSize: 20, fontWeight: "700" },
    premiumBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.pageBg,
    },
    premiumBadgeActive: { backgroundColor: theme.colors.gold },
    premiumBadgeText: { fontSize: 12, fontWeight: "700", color: theme.colors.accent },
    premiumBadgeTextActive: { color: "#3a2a00" },
    input: {
      width: "100%",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 10,
      fontSize: 14,
      backgroundColor: theme.colors.pageBg,
      color: theme.colors.textPrimary,
    },
    genderRow: { flexDirection: "row", gap: 10, marginBottom: 10, width: "100%" },
    genderChip: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.pageBg,
    },
    genderChipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
    genderChipText: { fontSize: 14, fontWeight: "700", color: theme.colors.textMuted },
    genderChipTextActive: { color: "white" },
    error: { color: theme.colors.danger, fontSize: 13, marginBottom: 10 },
    primaryButton: {
      width: "100%",
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.md,
      paddingVertical: 13,
      alignItems: "center",
    },
    primaryButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
    switchModeText: { color: theme.colors.accent, fontSize: 13, fontWeight: "700" },
    signOutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 12,
    },
    signOutText: { color: theme.colors.danger, fontWeight: "700" },
  });
}
