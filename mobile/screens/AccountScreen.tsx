import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { useNotificationSettings } from "../lib/notifications";
import { getHomeCity, getHomeMasjidId } from "../lib/homeMasjid";
import { rootNavigate } from "../lib/navigationRef";
import { theme } from "../theme";

function YourMasjidCard() {
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
      <Text style={styles.cardTitle}>Your Masjid</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 8 }} />
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

function AuthForm() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    setNotice(null);

    if (mode === "signIn") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) setError(error.message);
      else setNotice("Account created! Check your email to confirm, then sign in.");
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
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
        )}
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
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

function ProfileView({ profile }: { profile: { full_name: string | null } }) {
  const { enabled, loading, toggle } = useNotificationSettings();

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
      </View>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Prayer time reminders</Text>
            <Text style={styles.settingSubtitle}>
              Get a notification at each Adhan time today.
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Switch value={enabled} onValueChange={toggle} />
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AccountScreen() {
  const { loading, session, profile } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <YourMasjidCard />
      {session && profile ? (
        <ProfileView profile={profile} />
      ) : (
        <AuthForm />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.md, backgroundColor: theme.colors.pageBg, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    ...theme.cardShadow,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: "flex-start",
  },
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
  },
  error: { color: "#dc2626", fontSize: 13, marginBottom: 10 },
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
  settingRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  settingLabel: { fontSize: 15, fontWeight: "600", color: theme.colors.textPrimary },
  settingSubtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  signOutButton: { alignItems: "center", paddingVertical: 12 },
  signOutText: { color: "#dc2626", fontWeight: "700" },
});
