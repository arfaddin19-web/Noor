import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "expo-constants";
import { supabase } from "../lib/supabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const { supabaseUrl } = (Constants.expoConfig?.extra ?? {}) as { supabaseUrl?: string };
const FUNCTION_URL = `${supabaseUrl}/functions/v1/ask-ai`;

export default function AskAiScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      text:
        "Assalamu alaikum! Ask me anything about Islam — beliefs, worship, history, or " +
        "everyday life. For personal religious rulings, I'll point you to a qualified scholar.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function send() {
    const question = input.trim();
    if (!question || sending) return;

    setInput("");
    const userMsg: Message = { id: Date.now() + "-u", role: "user", text: question };
    setMessages((m) => [...m, userMsg]);
    setSending(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ question, user_id: session?.user?.id ?? null }),
      });
      const json = await res.json();
      const answer: string = json.answer ?? "Sorry, something went wrong. Please try again.";
      setMessages((m) => [...m, { id: Date.now() + "-a", role: "assistant", text: answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + "-e",
          role: "assistant",
          text: "Sorry, I couldn't reach the server. Please check your connection and try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
            ]}
          >
            <Text style={item.role === "user" ? styles.bubbleTextUser : styles.bubbleText}>
              {item.text}
            </Text>
          </View>
        )}
      />
      {sending && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.typingText}>Thinking…</Text>
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question…"
          style={styles.input}
          multiline
        />
        <TouchableOpacity onPress={send} style={styles.sendButton} disabled={sending}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "85%", borderRadius: 14, padding: 12, marginBottom: 10 },
  bubbleUser: { alignSelf: "flex-end", backgroundColor: "#0e8a72" },
  bubbleAssistant: { alignSelf: "flex-start", backgroundColor: "white" },
  bubbleText: { color: "#111827", lineHeight: 20 },
  bubbleTextUser: { color: "white", lineHeight: 20 },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  typingText: { color: "#6b7280", fontSize: 12 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#0e8a72",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: { color: "white", fontWeight: "600" },
});
