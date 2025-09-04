export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function aiChat(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; max_tokens?: number }
) {
  const API_KEY = "AIzaSyCew-NVl-fiA1wJyzmo7x5cJevueHidq9I";
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
  
  console.log("Making direct Gemini API request with:", { messages, options });
  
  try {
    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const requestBody = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.max_tokens ?? 384,
      }
    };

    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    console.log("Gemini API response:", { status: res.status, data });

    if (!res.ok) {
      const errorMessage = data.error?.message || `Gemini API error: ${res.status}`;
      console.error("Gemini API error:", errorMessage);
      throw new Error(errorMessage);
    }

    // Extract response content
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    
    // Return in expected format
    const result = {
      choices: [{
        message: {
          role: "assistant",
          content: content
        }
      }]
    };
    
    console.log("Parsed AI result:", result);
    return result;
  } catch (error) {
    console.error("AI chat error:", error);
    throw error;
  }
}

export function buildTaskContext(params: {
  businessName?: string;
  tasks: Array<{ title: string; description?: string; priority?: string; status?: string; dueDate?: string }>;
}) {
  const { businessName, tasks } = params;
  const summary = tasks
    .slice(0, 50)
    .map((t) => `- ${t.title} [${t.status || "todo"} | ${t.priority || "medium"}${t.dueDate ? ` | due ${t.dueDate}` : ""}]`)
    .join("\n");
  return `You are MultiBiz AI, an operations copilot. Business: ${businessName || "Current"}.\nHere are current tasks:\n${summary}`;
}

// Suggested task shape from AI (draft)
export type SuggestedTask = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string; // YYYY-MM-DD
};

// Try to extract a tasks array from an AI response. Accepts JSON or numbered lines.
export function parseSuggestedTasksFromText(text: string): SuggestedTask[] {
  const out: SuggestedTask[] = [];
  // JSON first
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const obj = JSON.parse(jsonMatch[0]);
      const tasks = Array.isArray(obj?.tasks) ? obj.tasks : [];
      for (const t of tasks) {
        if (t?.title && typeof t.title === "string") {
          out.push({
            title: t.title,
            description: typeof t.description === "string" ? t.description : undefined,
            priority: ["low", "medium", "high"].includes(t.priority) ? t.priority : undefined,
            dueDate: typeof t.dueDate === "string" ? t.dueDate : undefined,
          });
        }
      }
      if (out.length) return out;
    } catch {}
  }
  // Numbered lines fallback: 1. Title ...
  const lines = text.split(/\n|\r/).map((l) => l.trim());
  for (const l of lines) {
    const m = l.match(/^\d+[\).]\s*(.+)$/);
    if (m && m[1]) out.push({ title: m[1] });
  }
  return out;
}


