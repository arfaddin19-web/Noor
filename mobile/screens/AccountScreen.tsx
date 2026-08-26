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
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenBackground from "../components/ScreenBackground";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { getHomeCity, getHomeMasjidId } from "../lib/homeMasjid";
import { rootNavigate } from "../lib/navigationRef";
import { isValidPhone, normalizePhone, phoneToSyntheticEmail } from "../lib/phoneAuth";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Gender = "male" | "female";

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

function AuthForm({ theme, styles }: { theme: Theme; styles: ReturnType<typeof makeStyles> }) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setNotice(null);

    if (!isValidPhone(phone)) {
      setError("Enter a valid phone number.");
      return;
    }
    if (mode === "signUp" && (!fullName.trim() || !gender)) {
      setError("Full name and gender are required.");
      return;
    }

    setLoading(true);
    const syntheticEmail = phoneToSyntheticEmail(phone);

    if (mode === "signIn") {
      const { error } = await supabase.auth.signInWithPassword({ email: syntheticEmail, password });
      if (error) setError("Couldn't sign in — check your phone number and password.");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: syntheticEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: normalizePhone(phone),
            city: city.trim() || null,
            gender,
          },
        },
      });
      if (error) {
        setError(
          error.message.includes("already registered")
            ? "That phone number is already registered — try signing in instead."
            : error.message
        );
      } else if (data.session) {
        setNotice("Account created — you're signed in.");
      } else {
        // Supabase's "Confirm email" setting is still on; since there's no real
        // email behind a phone sign-up, that has to be turned off in the
        // Supabase Dashboard (Authentication → Sign In / Providers → Email)
        // for phone accounts to be usable right after signing up.
        setNotice("Account created, but sign-in is pending email confirmation — ask the app admin to turn that off for phone accounts.");
      }
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {mode === "signIn" ? "Sign in" : "Create an account"}
        </Text>
        <Text style={styles.cardSubtitle}>
          Signing in lets you keep your "Ask" question history saved across devices.
        </Text>

        {mode === "signUp" && (
          <TextInput
            placeholder="Full name"
            placeholderTextColor={theme.colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
        )}
        <TextInput
          placeholder="Phone number"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />
        {mode === "signUp" && (
          <TextInput
            placeholder="City / District"
            placeholderTextColor={theme.colors.textMuted}
            value={city}
            onChangeText={setCity}
            style={styles.input}
          />
        )}
        {mode === "signUp" && (
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
        )}
        <TextInput
          placeholder="Password"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {notice && <Text style={styles.notice}>{notice}</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === "signIn" ? "Sign in" : "Sign up"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
          style={{ marginTop: 12 }}
        >
          <Text style={styles.switchModeText}>
            {mode === "signIn"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function ProfileView({
  profile,
  theme,
  styles,
}: {
  profile: { full_name: string | null; phone: string | null; city: string | null };
  theme: Theme;
  styles: ReturnType<typeof makeStyles>;
}) {
  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <View>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile.full_name ?? "N").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.cardTitle}>{profile.full_name ?? "Assalamu alaikum"}</Text>
        {(profile.phone || profile.city) && (
          <Text style={styles.cardSubtitle}>
            {[profile.phone, profile.city].filter(Boolean).join(" — ")}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={16} color={theme.colors.danger} />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AccountScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { loading, session, profile } = useAuth();

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

        {session && profile ? (
          <ProfileView profile={profile} theme={theme} styles={styles} />
        ) : (
          <AuthForm theme={theme} styles={styles} />
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
    notice: { color: theme.colors.accent, fontSize: 13, marginBottom: 10 },
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
