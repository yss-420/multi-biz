import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const GEMINI_API_KEY = "AIzaSyCew-NVl-fiA1wJyzmo7x5cJevueHidq9I";

async function callGemini(messages, temperature = 0.2, max_tokens = 384) {
  const prompt = messages.map(m => {
    if (m.role === "user") return m.content;
    if (m.role === "assistant") return m.content;
    if (m.role === "system") return m.content;
    return m.content;
  }).join("\n\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: max_tokens,
      }
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini API error");
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  return {
    choices: [{
      message: {
        role: "assistant",
        content: content
      }
    }]
  };
}

app.post("/chat", async (req, res) => {
  try {
    const { messages, temperature = 0.2, max_tokens = 384 } = req.body || {};
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const result = await callGemini(messages, temperature, max_tokens);
    res.status(200).json(result);
  } catch (e) {
    console.error("/chat error", e);
    res.status(500).json({ error: "AI proxy failure", details: e.message });
  }
});

const PORT = process.env.PORT || 8787;

app.post("/chat/completions", async (req, res) => {
  try {
    const { messages, temperature = 0.7, max_tokens } = req.body || {};
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const result = await callGemini(messages, temperature, max_tokens);
    res.status(200).json(result);
  } catch (e) {
    console.error("/chat/completions error", e);
    res.status(500).json({ error: "AI proxy failure", details: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`[AI] Gemini proxy listening at http://localhost:${PORT}`);
});