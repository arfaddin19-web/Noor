import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

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
    if (qiblaBearing === null) return;
    const target = (qiblaBearing - heading + 360) % 360;
    Animated.timing(rotation, {
      toValue: target,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [heading, qiblaBearing]);

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

  const spin = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Face this direction for the Qibla</Text>
      <View style={styles.compassWrap}>
        <Animated.View style={[styles.needle, { transform: [{ rotate: spin }] }]}>
          <Text style={styles.needleArrow}>🕋</Text>
        </Animated.View>
        <View style={styles.compassRing} />
      </View>
      <Text style={styles.bearingText}>{Math.round(qiblaBearing)}° from true north</Text>
      <Text style={styles.hint}>
        Hold your phone flat. The Kaaba icon points toward Makkah as you turn.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  muted: { color: "#6b7280", textAlign: "center" },
  title: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 8 },
  compassWrap: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  compassRing: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4,
    borderColor: "#0e8a72",
  },
  needle: { alignItems: "center", justifyContent: "flex-start", height: 240 },
  needleArrow: { fontSize: 40, marginTop: 8 },
  bearingText: { marginTop: 16, fontSize: 18, fontWeight: "600", color: "#0e8a72" },
  hint: { marginTop: 8, color: "#6b7280", textAlign: "center", paddingHorizontal: 24 },
});
