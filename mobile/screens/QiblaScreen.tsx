import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { theme } from "../theme";

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const RING_SIZE = 300;
const TICK_RADIUS = 138;
const LABEL_RADIUS = 112;
const ALIGN_TOLERANCE_DEG = 6;

const DIRECTIONS = [
  { bearing: 0, label: "N", major: true },
  { bearing: 45, label: "NE", major: false },
  { bearing: 90, label: "E", major: true },
  { bearing: 135, label: "SE", major: false },
  { bearing: 180, label: "S", major: true },
  { bearing: 225, label: "SW", major: false },
  { bearing: 270, label: "W", major: true },
  { bearing: 315, label: "NW", major: false },
];

const TICKS = Array.from({ length: 36 }, (_, i) => i * 10);

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

/** Great-circle bearing from (lat1,lng1) to (lat2,lng2), in degrees from true north. */
function bearingTo(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Smallest signed difference (in degrees, -180..180) from `a` to `b`. */
function angleDiff(a: number, b: number): number {
  return ((b - a + 540) % 360) - 180;
}

function useMagnetometerHeading() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    Magnetometer.setUpdateInterval(200);
    const sub = Magnetometer.addListener(({ x, y }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = (angle + 90 + 360) % 360; // adjust so 0 = north-ish; device-dependent
      setHeading(angle);
    });
    return () => sub.remove();
  }, []);

  return heading;
}

/** Places `children` at a fixed compass bearing + radius from the center of its parent,
 *  keeping the content itself upright. Meant to sit inside a rotating dial. */
function CompassMark({
  bearing,
  radius,
  children,
}: {
  bearing: number;
  radius: number;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { alignItems: "center" },
        { transform: [{ rotate: `${bearing}deg` }] },
      ]}
    >
      <View style={{ transform: [{ translateY: -radius }, { rotate: `${-bearing}deg` }] }}>
        {children}
      </View>
    </View>
  );
}

/** The Qibla needle — a full-diameter bar that rotates (within the dial) to point at
 *  `bearing`: a red half toward the Kaaba, a muted tail on the opposite side. */
function Needle({ bearing }: { bearing: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${bearing}deg` }] }]}>
      <View style={styles.needleTop} />
      <View style={styles.needleBottom} />
      <View style={styles.needleTip}>
        <Text style={styles.needleTipIcon}>🕋</Text>
      </View>
    </View>
  );
}

export default function QiblaScreen() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const heading = useMagnetometerHeading();
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location permission is needed to find the Qibla direction.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const bearing = bearingTo(
        pos.coords.latitude,
        pos.coords.longitude,
        KAABA_LAT,
        KAABA_LNG
      );
      setQiblaBearing(bearing);
    })();
  }, []);

  useEffect(() => {
    // Rotate the whole dial opposite to the device heading, like a real compass —
    // North (and every mark/the needle) then points the true direction.
    const target = (-heading + 360) % 360;
    Animated.timing(rotation, {
      toValue: target,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [heading]);

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{errorMsg}</Text>
      </View>
    );
  }

  if (qiblaBearing === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Finding your location…</Text>
      </View>
    );
  }

  const dialSpin = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const isAligned = Math.abs(angleDiff(heading, qiblaBearing)) < ALIGN_TOLERANCE_DEG;

  return (
    <View style={styles.page}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Qibla: {Math.round(qiblaBearing)}°</Text>
        <Text style={styles.headerText}>Current: {Math.round(heading)}°</Text>
      </View>

      <View style={styles.compassWrap}>
        <View style={styles.compassRing} />

        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: dialSpin }] }]}>
          {TICKS.map((deg) => {
            const isMajorAxis = deg % 90 === 0;
            const isDiagonal = deg % 45 === 0 && !isMajorAxis;
            return (
              <CompassMark key={deg} bearing={deg} radius={TICK_RADIUS}>
                <View
                  style={[
                    styles.tick,
                    isMajorAxis && styles.tickMajor,
                    isDiagonal && styles.tickMinorLong,
                  ]}
                />
              </CompassMark>
            );
          })}
          {DIRECTIONS.map((d) => (
            <CompassMark key={d.label} bearing={d.bearing} radius={LABEL_RADIUS}>
              <Text style={d.major ? styles.dirLabelMajor : styles.dirLabel}>{d.label}</Text>
            </CompassMark>
          ))}

          <Needle bearing={qiblaBearing} />
        </Animated.View>

        <View style={[styles.centerHub, isAligned && styles.centerHubAligned]} />
      </View>

      <Text style={[styles.statusText, isAligned && styles.statusTextAligned]}>
        {isAligned ? "You're facing Kaaba now" : "Turn until the 🕋 points to the top"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.pageBg, alignItems: "center", paddingTop: 24 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: theme.colors.pageBg,
  },
  muted: { color: theme.colors.textMuted, textAlign: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 28,
    marginBottom: 20,
  },
  headerText: { fontSize: 13, fontWeight: "700", color: theme.colors.textMuted },
  compassWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  compassRing: {
    ...theme.cardShadow,
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 10,
    borderColor: "#f3ecdd",
    backgroundColor: theme.colors.cardBg,
  },
  tick: { width: 2, height: 8, backgroundColor: "#d8c9a3" },
  tickMinorLong: { height: 12, backgroundColor: theme.colors.gold },
  tickMajor: { width: 3, height: 16, backgroundColor: theme.colors.accent },
  dirLabel: { fontSize: 12, fontWeight: "700", color: theme.colors.gold },
  dirLabelMajor: { fontSize: 15, fontWeight: "800", color: theme.colors.accent },
  needleTop: {
    position: "absolute",
    top: 22,
    left: RING_SIZE / 2 - 4,
    width: 8,
    height: RING_SIZE / 2 - 22,
    backgroundColor: "#d64545",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  needleBottom: {
    position: "absolute",
    bottom: 22,
    left: RING_SIZE / 2 - 4,
    width: 8,
    height: RING_SIZE / 2 - 22,
    backgroundColor: "#94a3b8",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  needleTip: {
    position: "absolute",
    top: -4,
    left: RING_SIZE / 2 - 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.cardBg,
    borderWidth: 2,
    borderColor: "#d64545",
    alignItems: "center",
    justifyContent: "center",
  },
  needleTipIcon: { fontSize: 18 },
  centerHub: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.textPrimary,
    borderWidth: 3,
    borderColor: theme.colors.cardBg,
  },
  centerHubAligned: { backgroundColor: theme.colors.accent },
  statusText: {
    marginTop: 28,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  statusTextAligned: { color: theme.colors.accent },
});
