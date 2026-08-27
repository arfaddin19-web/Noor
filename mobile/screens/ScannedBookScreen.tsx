import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useFocusEffect, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { HomeStackParamList } from "../App";
import { scannedBookPageUrl } from "../lib/scannedBooks";
import { getLastScannedBookPage, saveLastScannedBookPage } from "../lib/scannedBookProgress";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Route = RouteProp<HomeStackParamList, "ScannedBook">;

/** Generic viewer for any book shown as scanned page images, fetched from
 *  Supabase Storage rather than bundled into the app — see lib/scannedBooks.ts
 *  for why (source PDFs where Arabic/English are too tightly interleaved
 *  per-hadith for reliable text extraction; showing the real page sidesteps
 *  that entirely). Works for Muntakhab Ahadith today and any future book of
 *  this kind with zero code changes — just run
 *  admin/scripts/upload-book-pages.js and add a scanned_books row. */
export default function ScannedBookScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const route = useRoute<Route>();
  const { slug, pageCount } = route.params;
  const listRef = useRef<FlatList<number>>(null);
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [ready, setReady] = useState(false);

  const pages = useMemo(() => Array.from({ length: pageCount }, (_, i) => i), [pageCount]);

  useEffect(() => {
    getLastScannedBookPage(slug).then((p) => {
      setPageIndex(Math.min(Math.max(p - 1, 0), pageCount - 1));
      setReady(true);
    });
  }, [slug, pageCount]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        saveLastScannedBookPage(slug, pageIndex + 1);
      };
    }, [slug, pageIndex])
  );

  function goTo(index: number) {
    const clamped = Math.min(Math.max(index, 0), pageCount - 1);
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setPageIndex(clamped);
  }

  if (!ready) return null;

  return (
    <View style={styles.page}>
      <FlatList
        ref={listRef}
        data={pages}
        keyExtractor={(i) => String(i)}
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
        renderItem={({ item }) => <BookPage uri={scannedBookPageUrl(slug, item + 1)} styles={styles} />}
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
          Page {pageIndex + 1} of {pageCount}
        </Text>
        <TouchableOpacity onPress={() => goTo(pageIndex + 1)} disabled={pageIndex === pageCount - 1}>
          <Ionicons
            name="chevron-forward-circle"
            size={30}
            color={pageIndex === pageCount - 1 ? theme.colors.border : theme.colors.accent}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BookPage({ uri, styles }: { uri: string; styles: ReturnType<typeof makeStyles> }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  return (
    <ScrollView
      style={{ width: SCREEN_WIDTH }}
      contentContainerStyle={styles.zoomContent}
      maximumZoomScale={4}
      minimumZoomScale={1}
      centerContent
    >
      {loading && !failed && <ActivityIndicator color="#fff" style={StyleSheet.absoluteFill} />}
      {failed ? (
        <Text style={styles.errorText}>Couldn't load this page. Check your internet connection.</Text>
      ) : (
        <Image
          source={{ uri }}
          style={styles.pageImage}
          resizeMode="contain"
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      )}
    </ScrollView>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: "#1a1a1a" },
    zoomContent: { flexGrow: 1, alignItems: "center", justifyContent: "center", minHeight: "100%" },
    pageImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.3 },
    errorText: { color: "#ccc", fontSize: 14, textAlign: "center", padding: theme.spacing.lg },
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
