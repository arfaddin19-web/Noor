import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { MUNTAKHAB_PAGES, MUNTAKHAB_PAGE_COUNT } from "../lib/muntakhabAhadithPages";
import { getLastMuntakhabPage, saveLastMuntakhabPage } from "../lib/muntakhabAhadithProgress";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** Muntakhab Ahadith (English) — shown as scanned page images rather than
 *  extracted text. The PDF interleaves Arabic and English tightly around
 *  every hadith (unlike Bahishti Zewar's continuous English prose), and text
 *  extraction genuinely scrambled sentence order across multiple attempts —
 *  risking misattributing what a hadith says, which isn't an acceptable
 *  shortcut for source text. Showing the real page image sidesteps that
 *  entirely: what's on screen is exactly what's in the book. Each page is a
 *  two-page spread from the original scan (that's how it was scanned), ~350
 *  images bundled locally (see lib/muntakhabAhadithPages.ts) — no network
 *  dependency, works offline. Pinch to zoom in on any page for detail. */
export default function MuntakhabAhadithScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const listRef = useRef<FlatList<number>>(null);
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getLastMuntakhabPage().then((p) => {
      setPageIndex(Math.min(Math.max(p - 1, 0), MUNTAKHAB_PAGE_COUNT - 1));
      setReady(true);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        saveLastMuntakhabPage(pageIndex + 1);
      };
    }, [pageIndex])
  );

  function goTo(index: number) {
    const clamped = Math.min(Math.max(index, 0), MUNTAKHAB_PAGE_COUNT - 1);
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setPageIndex(clamped);
  }

  if (!ready) return null;

  return (
    <View style={styles.page}>
      <FlatList
        ref={listRef}
        data={MUNTAKHAB_PAGES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={pageIndex}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setPageIndex(idx);
        }}
        initialNumToRender={1}
        windowSize={3}
        maxToRenderPerBatch={2}
        renderItem={({ item }) => (
          <ScrollView
            style={{ width: SCREEN_WIDTH }}
            contentContainerStyle={styles.zoomContent}
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
          >
            <Image source={item} style={styles.pageImage} resizeMode="contain" />
          </ScrollView>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => goTo(pageIndex - 1)} disabled={pageIndex === 0}>
          <Ionicons
            name="chevron-back-circle"
            size={30}
            color={pageIndex === 0 ? theme.colors.border : theme.colors.accent}
          />
        </TouchableOpacity>
        <Text style={styles.pageLabel}>
          Page {pageIndex + 1} of {MUNTAKHAB_PAGE_COUNT}
        </Text>
        <TouchableOpacity
          onPress={() => goTo(pageIndex + 1)}
          disabled={pageIndex === MUNTAKHAB_PAGE_COUNT - 1}
        >
          <Ionicons
            name="chevron-forward-circle"
            size={30}
            color={pageIndex === MUNTAKHAB_PAGE_COUNT - 1 ? theme.colors.border : theme.colors.accent}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: "#1a1a1a" },
    zoomContent: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
    pageImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.3 },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 12,
      backgroundColor: theme.colors.cardBg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    pageLabel: { fontSize: 13, fontWeight: "700", color: theme.colors.textPrimary },
  });
}
