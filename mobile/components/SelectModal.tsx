import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../theme";

export interface SelectOption {
  key: string;
  label: string;
  sublabel?: string;
}

/** A tap-to-open field that presents a searchable list of options in a modal —
 *  our stand-in for a native <select>/dropdown. */
export default function SelectModal({
  label,
  placeholder,
  value,
  options,
  onSelect,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: SelectOption | null;
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q)
    );
  }, [options, query]);

  return (
    <View style={{ width: "100%" }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.field, disabled && styles.fieldDisabled]}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.fieldText : styles.fieldPlaceholder}>
          {value?.label ?? placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search…"
            style={styles.search}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={(o) => o.key}
            ListEmptyComponent={<Text style={styles.empty}>No matches.</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onSelect(item);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <Text style={styles.optionLabel}>{item.label}</Text>
                {item.sublabel && <Text style={styles.optionSublabel}>{item.sublabel}</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: theme.colors.textOnDarkMuted, marginBottom: 6 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldDisabled: { opacity: 0.5 },
  fieldText: { color: theme.colors.textOnDark, fontSize: 15, fontWeight: "600" },
  fieldPlaceholder: { color: theme.colors.textOnDarkMuted, fontSize: 15 },
  chevron: { color: theme.colors.textOnDarkMuted, fontSize: 14 },
  modal: { flex: 1, backgroundColor: theme.colors.pageBg, paddingTop: 60 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.textPrimary },
  closeText: { color: theme.colors.accent, fontWeight: "600" },
  search: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  empty: { textAlign: "center", color: theme.colors.textMuted, marginTop: 40 },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  optionLabel: { fontSize: 15, fontWeight: "600", color: theme.colors.textPrimary },
  optionSublabel: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
});
