import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const RING_SIZE = 250;
const TICK_RADIUS = 115;
const LABEL_RADIUS = 90;
const KAABA_RADIUS = 104;
const ALIGN_TOLERANCE_DEG = 6;

// Apple Compass-style dial: big cardinal letters at N/E/S/W, plain degree
// numbers at the other 30°-interval marks.
const DIAL_MARKS = [
  { bearing: 0, label: "N", cardinal: true },
  { bearing: 30, label: "30", cardinal: false },
  { bearing: 60, label: "60", cardinal: false },
  { bearing: 90, label: "E", cardinal: true },
  { bearing: 120, label: "120", cardinal: false },
  { bearing: 150, label: "150", cardinal: false },
  { bearing: 180, label: "S", cardinal: true },
  { bearing: 210, label: "210", cardinal: false },
  { bearing: 240, label: "240", cardinal: false },
  { bearing: 270, label: "W", cardinal: true },
  { bearing: 300, label: "300", cardinal: false },
  { bearing: 330, label: "330", cardinal: false },
];

// A tick every 3° (matching the dense ring in the reference photo), longer at
// every 15° and longest at the cardinals/30° marks.
const TICKS = Array.from({ length: 120 }, (_, i) => i * 3);

const COMPASS_POINTS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

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

/** Nearest 8-point compass abbreviation for a bearing, e.g. "270° W" the way
 *  the iPhone Compass app labels its heading readout. */
function compassPoint(deg: number): string {
  return COMPASS_POINTS[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

/** The device's compass heading (0 = true north, clockwise), from the same OS
 *  sensor-fusion API the native Compass app uses — tilt-compensated and far
 *  more reliable than doing atan2() on the raw magnetometer vector ourselves. */
function useDeviceHeading() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    Location.watchHeadingAsync((h) => {
      // trueHeading is -1 when the device can't determine it yet (e.g. still
      // calibrating) — magHeading is always available as a fallback.
      setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading);
    }).then((s) => {
      if (cancelled) s.remove();
      else sub = s;
    });

    return () => {
      cancelled = true;
      sub?.remove();
    };
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

/** A small drawn Kaaba icon — a black cube with the gold-embroidered band
 *  (kiswah) near the top — instead of the 🕋 emoji, which renders
 *  inconsistently across devices/fonts, same reasoning as the rest of the
 *  app's move to drawn/vector icons over emoji. */
function KaabaIcon({ size = 16 }: { size?: number }) {
  return (
    <View style={[kaabaStyles.cube, { width: size, height: size, borderRadius: size * 0.15 }]}>
      <View style={[kaabaStyles.band, { top: size * 0.32, height: size * 0.16 }]} />
    </View>
  );
}

const kaabaStyles = StyleSheet.create({
  cube: { backgroundColor: "#0e0e0e", borderWidth: 1, borderColor: "#2a2a2a", overflow: "hidden" },
  band: { position: "absolute", left: 0, right: 0, backgroundColor: "#c9a227" },
});

export default function QiblaScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const heading = useDeviceHeading();
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
    // North (and every mark/the needle) then points the true direction. The top
    // of the ring, under the fixed pointer, always represents "where your phone
    // is currently facing."
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
      <Text style={[styles.headingReadout, isAligned && styles.headingReadoutAligned]}>
        {Math.round(heading)}° {compassPoint(heading)}
      </Text>
      <Text style={styles.qiblaSubtext}>Qibla is at {Math.round(qiblaBearing)}°</Text>

      <View style={styles.compassWrap}>
        {/* Fixed pointer — always at the top, doesn't rotate. Represents the top
            of your phone, i.e. the direction you're physically facing. This is
            the same convention as the iPhone's own Compass app: the dial turns
            underneath a fixed reference marker, rather than the marker moving. */}
        <View style={[styles.fixedPointer, isAligned && styles.fixedPointerAligned]} />

        <View style={styles.compassRing} />

        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: dialSpin }] }]}>
          {TICKS.map((deg) => {
            const isCardinal = deg % 90 === 0;
            const isThirty = deg % 30 === 0 && !isCardinal;
            const isFifteen = deg % 15 === 0 && !isThirty && !isCardinal;
            return (
              <CompassMark key={deg} bearing={deg} radius={TICK_RADIUS}>
                <View
                  style={[
                    styles.tick,
                    isFifteen && styles.tickFifteen,
                    isThirty && styles.tickThirty,
                    isCardinal && styles.tickCardinal,
                  ]}
                />
              </CompassMark>
            );
          })}
          {DIAL_MARKS.map((m) => (
            <CompassMark key={m.label} bearing={m.bearing} radius={LABEL_RADIUS}>
              <Text style={m.cardinal ? styles.dirLabelCardinal : styles.dirLabel}>{m.label}</Text>
            </CompassMark>
          ))}

          {/* Small Kaaba icon marking the Qibla bearing directly on the dial
              (in place of whatever plain degree tick would otherwise sit
              there), plus the needle pointing at the same bearing. */}
          <CompassMark bearing={qiblaBearing} radius={KAABA_RADIUS}>
            <View style={styles.kaabaBadge}>
              <KaabaIcon size={15} />
            </View>
          </CompassMark>

          <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${qiblaBearing}deg` }] }]}>
            <View style={styles.needleTop} />
            <View style={styles.needleBottom} />
          </View>
        </Animated.View>

        <View style={[styles.centerHub, isAligned && styles.centerHubAligned]} />
      </View>

      <View style={styles.statusRow}>
        <KaabaIcon size={16} />
        <Text style={[styles.statusText, isAligned && styles.statusTextAligned]}>
          {isAligned ? "You're facing the Kaaba now" : "Turn until the Kaaba icon lines up with the pointer at the top"}
        </Text>
      </View>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: "#000", alignItems: "center", paddingTop: 24 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#000",
  },
  muted: { color: "#9a9a9a", textAlign: "center" },
  headingReadout: { fontSize: 44, fontWeight: "300", color: "white", letterSpacing: 1 },
  headingReadoutAligned: { color: "#3ecf6a" },
  qiblaSubtext: { fontSize: 13, color: "#9a9a9a", marginTop: 2, marginBottom: 20, fontWeight: "600" },
  compassWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  fixedPointer: {
    position: "absolute",
    top: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#e0342a",
    zIndex: 2,
  },
  fixedPointerAligned: { borderTopColor: "#3ecf6a" },
  compassRing: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1,
    borderColor: "#2c2c2c",
    backgroundColor: "#111",
  },
  tick: { width: 1, height: 5, backgroundColor: "#4a4a4a" },
  tickFifteen: { height: 7, backgroundColor: "#6e6e6e" },
  tickThirty: { width: 1.5, height: 10, backgroundColor: "#a8a8a8" },
  tickCardinal: { width: 2, height: 14, backgroundColor: "white" },
  dirLabel: { fontSize: 12, fontWeight: "600", color: "#c9c9c9" },
  dirLabelCardinal: { fontSize: 17, fontWeight: "700", color: "white" },
  kaabaBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2a2a2a",
    borderWidth: 1.5,
    borderColor: "#c9a227",
    alignItems: "center",
    justifyContent: "center",
  },
  needleTop: {
    position: "absolute",
    top: 25,
    left: RING_SIZE / 2 - 1,
    width: 2,
    height: RING_SIZE / 2 - 43,
    backgroundColor: "#e0342a",
  },
  needleBottom: {
    position: "absolute",
    bottom: 18,
    left: RING_SIZE / 2 - 1,
    width: 2,
    height: RING_SIZE / 2 - 18,
    backgroundColor: "#4a4a4a",
  },
  centerHub: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "#111",
  },
  centerHubAligned: { backgroundColor: "#3ecf6a" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 24, paddingHorizontal: 24 },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#c9c9c9",
    textAlign: "center",
  },
  statusTextAligned: { color: "#3ecf6a" },
  });
}
