import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

function ToolButton({
  icon,
  label,
  active,
  onPress,
  theme,
  styles,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  active?: boolean;
  onPress: () => void;
  theme: Theme;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name={icon} size={19} color={active ? theme.colors.accent : theme.colors.textMuted} />
      <Text style={[styles.buttonLabel, active && styles.buttonLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function QuranReaderToolbar({
  bookmarked,
  onToggleBookmark,
  onShare,
  showTranslation,
  onToggleTranslation,
  textSizeLabel,
  onCycleTextSize,
}: {
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  textSizeLabel: string;
  onCycleTextSize: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.bar}>
      <ToolButton
        icon={bookmarked ? "bookmark" : "bookmark-outline"}
        label="Bookmark"
        active={bookmarked}
        onPress={onToggleBookmark}
        theme={theme}
        styles={styles}
      />
      <ToolButton
        icon="text"
        label={`Text: ${textSizeLabel}`}
        onPress={onCycleTextSize}
        theme={theme}
        styles={styles}
      />
      <ToolButton
        icon="language-outline"
        label="Translation"
        active={showTranslation}
        onPress={onToggleTranslation}
        theme={theme}
        styles={styles}
      />
      <ToolButton icon="share-outline" label="Share" onPress={onShare} theme={theme} styles={styles} />
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingVertical: 10,
      backgroundColor: theme.colors.cardBg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    button: { alignItems: "center", gap: 3, paddingVertical: 4, paddingHorizontal: 8 },
    buttonLabel: { fontSize: 10, fontWeight: "600", color: theme.colors.textMuted },
    buttonLabelActive: { color: theme.colors.accent },
  });
}
