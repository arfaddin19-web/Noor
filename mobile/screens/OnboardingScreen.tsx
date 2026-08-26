import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MosqueSkyline from "../components/MosqueSkyline";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Welcome to your daily\nprayer companion",
    body: "Accurate prayer times, Qibla direction, Qur'an, and Hadith — all in one place.",
  },
  {
    title: "Noor",
    subtitle: "One Ummah, always connected",
    body: "Find masjids and halal food near you, wherever you are.",
  },
  {
    title: "Ask anything\nabout Islam",
    body: "A caring AI companion for your questions, alongside the guidance of real scholars.",
  },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const p = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (p !== page) setPage(p);
  }

  function goNext() {
    if (page < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * SCREEN_WIDTH, animated: true });
    } else {
      onDone();
    }
  }

  const isLast = page === SLIDES.length - 1;

  return (
    <LinearGradient
      colors={[theme.colors.skyTop, theme.colors.skyMid, theme.colors.skyBottom]}
      style={styles.flex}
    >
      <View style={styles.skipRow}>
        {!isLast && (
          <TouchableOpacity onPress={onDone}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Text style={styles.moon}>🌙</Text>
            {slide.subtitle ? (
              <>
                <Text style={styles.brand}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
              </>
            ) : (
              <Text style={styles.title}>{slide.title}</Text>
            )}
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.cta} onPress={goNext}>
          <Text style={styles.ctaText}>{isLast ? "Get Started" : "Next"}</Text>
        </TouchableOpacity>
      </View>

      <MosqueSkyline color={theme.colors.skylineDark} style={styles.skyline} />
    </LinearGradient>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
  flex: { flex: 1 },
  skipRow: { paddingTop: 56, paddingHorizontal: 24, alignItems: "flex-end", height: 90 },
  skipText: { color: theme.colors.textOnDarkMuted, fontSize: 14, fontWeight: "600" },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  moon: { fontSize: 56, marginBottom: 20 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.textOnDark,
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 16,
  },
  brand: {
    fontSize: 40,
    fontStyle: "italic",
    fontWeight: "700",
    color: theme.colors.textOnDark,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.gold,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    color: theme.colors.textOnDarkMuted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  footer: { alignItems: "center", paddingBottom: 190, gap: 20 },
  dots: { flexDirection: "row", gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: { backgroundColor: theme.colors.textOnDark, width: 22 },
  cta: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
  },
  ctaText: { color: "white", fontWeight: "700", fontSize: 15 },
  skyline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  });
}
