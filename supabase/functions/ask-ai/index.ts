// Noor — "Ask about Islam" AI Q&A edge function
//
// Proxies a user's question to the Claude API with a system prompt tuned
// for careful, source-aware answers on Islamic topics, then logs the
// exchange to ai_qa_history.
//
// Deploy: supabase functions deploy ask-ai
// Secrets: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from "jsr:@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM_PROMPT = `You are the "Ask about Islam" assistant inside the Noor app.
You answer questions about Islamic belief, practice, history, and daily life for a general
Muslim (and curious non-Muslim) audience.

Guidelines:
- Be respectful, warm, and clear. Prefer plain language over jargon; explain Arabic terms
  the first time you use them.
- For matters of core belief (aqidah) and well-established practice, answer directly and
  confidently, citing the relevant Qur'an ayah or hadith when it's well known and authentic.
- For questions where scholars differ (fiqh rulings across madhabs, contested contemporary
  issues), present the mainstream range of views neutrally rather than picking one as "the"
  answer, and say plainly that qualified local scholars should be consulted for personal
  rulings (fatwa), especially for high-stakes matters (divorce, inheritance, business
  contracts, medical/end-of-life decisions).
- Never fabricate a Qur'an ayah or hadith citation. If you are not confident of an exact
  reference, say so instead of inventing one.
- Do not issue personal religious rulings (fatwas) as if you were a qualified mufti — inform
  and educate, and point toward scholarly resources for anything requiring one.
- Keep answers focused and readable on a phone screen: a few short paragraphs, not an essay,
  unless the question needs more depth.`;

interface AskRequest {
  question: string;
  user_id?: string | null;
}

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "AI is not configured yet." }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const { question, user_id }: AskRequest = await req.json();

    if (!question || question.trim().length === 0) {
      return new Response(JSON.stringify({ error: "question is required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Anthropic API error:", errText);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const answer = aiJson.content?.[0]?.text ?? "Sorry, I couldn't generate an answer.";

    // Log the exchange (service role bypasses RLS; safe here since it's server-side)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from("ai_qa_history").insert({
      user_id: user_id ?? null,
      question,
      answer,
    });

    return new Response(JSON.stringify({ answer }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
