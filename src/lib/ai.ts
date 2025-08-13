export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function aiChat(messages: ChatMessage[], options?: { model?: string; temperature?: number }) {
  const res = await fetch("/api/ai/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: options?.model || "qwen/qwen3-4b:free",
      messages,
      temperature: options?.temperature ?? 0.7,
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


