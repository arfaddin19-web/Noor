import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const RING_SIZE = 260;
const MARK_RADIUS = 108;
const KAABA_RADIUS = 82;
const ALIGN_TOLERANCE_DEG = 6;

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
    // North (and every other mark on the dial) then points the true direction.
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
    <View style={styles.center}>
      <Text style={styles.title}>
        {isAligned
          ? "You're facing the Qibla"
          : "Turn until the 🕋 lines up with the marker above it"}
      </Text>

      <View style={styles.compassWrap}>
        <View style={styles.compassRing} />

        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: dialSpin }] }]}>
          <CompassMark bearing={0} radius={MARK_RADIUS}>
            <Text style={styles.cardinalTextMajor}>N</Text>
          </CompassMark>
          <CompassMark bearing={90} radius={MARK_RADIUS}>
            <Text style={styles.cardinalText}>E</Text>
          </CompassMark>
          <CompassMark bearing={180} radius={MARK_RADIUS}>
            <Text style={styles.cardinalText}>S</Text>
          </CompassMark>
          <CompassMark bearing={270} radius={MARK_RADIUS}>
            <Text style={styles.cardinalText}>W</Text>
          </CompassMark>
          <CompassMark bearing={qiblaBearing} radius={KAABA_RADIUS}>
            <Text style={styles.kaabaIcon}>🕋</Text>
          </CompassMark>
        </Animated.View>

        {/* Fixed marker for "straight ahead" (where your phone is pointing) — this
            never rotates. When the 🕋 above lines up with it, you're facing Qibla. */}
        <View style={[styles.fixedPointer, isAligned && styles.fixedPointerAligned]} />
        <View style={styles.centerDot} />
      </View>

      <Text style={[styles.bearingText, isAligned && styles.bearingTextAligned]}>
        {isAligned ? "🕋 Aligned!" : `Qibla is ${Math.round(qiblaBearing)}° from true north`}
      </Text>
      <Text style={styles.hint}>
        Hold your phone flat, like a compass. The red marker at the top is the direction
        you're currently facing — turn your body until the 🕋 icon meets it.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  muted: { color: "#6b7280", textAlign: "center" },
  title: { fontSize: 16, fontWeight: "600", color: "#111827", textAlign: "center" },
  compassWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  compassRing: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 3,
    borderColor: "#d1d5db",
    backgroundColor: "white",
  },
  cardinalTextMajor: { fontSize: 16, fontWeight: "800", color: "#111827" },
  cardinalText: { fontSize: 14, fontWeight: "600", color: "#9ca3af" },
  kaabaIcon: { fontSize: 30 },
  fixedPointer: {
    position: "absolute",
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#dc2626",
  },
  fixedPointerAligned: { borderTopColor: "#0e8a72" },
  centerDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0e8a72",
  },
  bearingText: { fontSize: 18, fontWeight: "600", color: "#374151" },
  bearingTextAligned: { color: "#0e8a72" },
  hint: { color: "#6b7280", textAlign: "center", paddingHorizontal: 24 },
});
