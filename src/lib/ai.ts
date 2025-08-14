export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function aiChat(messages: ChatMessage[], options?: { model?: string; temperature?: number }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      temperature: options?.temperature ?? 0.2,
      max_tokens: 384,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    let message = `AI error: ${res.status}`;
    try { const j = JSON.parse(text); message = j?.error || message; } catch {}
    throw new Error(message);
  }
  try { return JSON.parse(text); } catch { return { error: "Invalid JSON", raw: text }; }
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


