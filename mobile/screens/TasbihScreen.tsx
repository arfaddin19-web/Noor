import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import { loadTasbihState, saveTasbihState } from "../lib/tasbih";
import { theme } from "../theme";

const TARGETS = [33, 99, 100];
const DHIKR_OPTIONS = ["SubhanAllah", "Alhamdulillah", "Allahu Akbar", "Astaghfirullah"];

export default function TasbihScreen() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [rounds, setRounds] = useState(0);
  const [dhikr, setDhikr] = useState(DHIKR_OPTIONS[0]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadTasbihState().then((s) => {
      setCount(s.count);
      setTarget(s.target);
      setRounds(s.rounds);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) saveTasbihState({ count, target, rounds });
  }, [count, target, rounds, ready]);

  function tap() {
    const next = count + 1;
    if (next >= target) {
      Vibration.vibrate(80);
      setCount(0);
      setRounds((r) => r + 1);
    } else {
      setCount(next);
    }
  }

  function reset() {
    setCount(0);
  }

  const progress = target > 0 ? count / target : 0;

  return (
    <View style={styles.page}>
      <View style={styles.chipRow}>
        {DHIKR_OPTIONS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.chip, dhikr === d && styles.chipActive]}
            onPress={() => setDhikr(d)}
          >
            <Text style={[styles.chipText, dhikr === d && styles.chipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.roundsRow}>
        <Text style={styles.roundsText}>Rounds completed: {rounds}</Text>
      </View>

      <TouchableOpacity style={styles.dial} onPress={tap} activeOpacity={0.85}>
        <View style={[styles.dialFill, { height: `${Math.min(100, progress * 100)}%` }]} />
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.target}>/ {target}</Text>
        <Text style={styles.tapHint}>Tap to count</Text>
      </TouchableOpacity>

      <View style={styles.targetRow}>
        {TARGETS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.targetChip, target === t && styles.targetChipActive]}
            onPress={() => {
              setTarget(t);
              setCount(0);
            }}
          >
            <Text style={[styles.targetChipText, target === t && styles.targetChipTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={reset}>
        <Text style={styles.resetText}>Reset count</Text>
      </TouchableOpacity>
    </View>
  );
}

const DIAL_SIZE = 220;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.pageBg, alignItems: "center", paddingTop: 20 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, paddingHorizontal: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  chipText: { fontSize: 12, fontWeight: "700", color: theme.colors.textMuted },
  chipTextActive: { color: "white" },
  roundsRow: { marginTop: 18 },
  roundsText: { fontSize: 13, color: theme.colors.textMuted, fontWeight: "600" },
  dial: {
    ...theme.cardShadow,
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    backgroundColor: theme.colors.cardBg,
    borderWidth: 6,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    overflow: "hidden",
  },
  dialFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(14,138,114,0.12)",
  },
  count: { fontSize: 56, fontWeight: "800", color: theme.colors.accent },
  target: { fontSize: 16, color: theme.colors.textMuted, marginTop: -6 },
  tapHint: { fontSize: 11, color: theme.colors.textMuted, marginTop: 10 },
  targetRow: { flexDirection: "row", gap: 10, marginTop: 30 },
  targetChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  targetChipActive: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  targetChipText: { fontSize: 13, fontWeight: "700", color: theme.colors.textMuted },
  targetChipTextActive: { color: "white" },
  resetButton: { marginTop: 20, paddingVertical: 10 },
  resetText: { color: theme.colors.textMuted, fontWeight: "600", fontSize: 13 },
});
