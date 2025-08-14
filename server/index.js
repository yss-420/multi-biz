import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
const PRIMARY_MODEL = "qwen/qwen3-4b:free";
const FALLBACKS = [
  "mistralai/mistral-7b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
];

async function callOpenRouter(body) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:8080",
      "X-Title": process.env.OPENROUTER_SITE_TITLE || "MultiBiz",
      Referer: process.env.OPENROUTER_SITE_URL || "http://localhost:8080",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { error: "Invalid JSON from OpenRouter", raw: text }; }
  return { status: r.status, json, raw: text };
}

app.post("/chat", async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) return res.status(500).json({ error: "Missing OPENROUTER_API_KEY on server" });

    const { messages, tools, tool_choice, temperature = 0.2, max_tokens = 384 } = req.body || {};
    const models = [PRIMARY_MODEL, ...FALLBACKS];
    let lastError = null;

    for (const model of models) {
      const body = { model, messages, tools, tool_choice, temperature, max_tokens };
      const { status, json, raw } = await callOpenRouter(body);
      if (status >= 200 && status < 300 && !json?.error) {
        return res.status(200).json(json);
      }
      lastError = { status, json, raw, model };
      // Try next model on any non-2xx or provider error
      continue;
    }
    console.error("/chat failed", lastError?.status, lastError?.json || lastError?.raw);
    res.status(502).json({ error: "All models failed", details: lastError });
  } catch (e) {
    console.error("/chat error", e);
    res.status(500).json({ error: "AI proxy failure" });
  }
});

const PORT = process.env.PORT || 8787;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.warn("[AI] Missing OPENROUTER_API_KEY env var");
}

app.post("/chat/completions", async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "Missing OPENROUTER_API_KEY on server" });
    }
    const { model, messages, temperature, max_tokens } = req.body || {};
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:8080",
        "X-Title": process.env.OPENROUTER_SITE_TITLE || "MultiBiz",
        Referer: process.env.OPENROUTER_SITE_URL || "http://localhost:8080",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "qwen/qwen3-4b:free",
        messages: messages && Array.isArray(messages) && messages.length ? messages : [{ role: "user", content: "Hello" }],
        temperature: temperature ?? 0.7,
        max_tokens,
      }),
    });
    const text = await r.text();
    if (!r.ok) {
      console.error("[AI] Upstream error", r.status, text);
    }
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { error: "Invalid JSON from OpenRouter", raw: text };
    }
    res.status(r.status).json(json);
  } catch (e) {
    console.error("/chat/completions error", e);
    res.status(500).json({ error: "AI proxy failure" });
  }
});

app.listen(PORT, () => {
  console.log(`[AI] Proxy listening at http://localhost:${PORT}`);
});


