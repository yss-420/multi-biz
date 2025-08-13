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
  if (!res.ok) throw new Error(`AI error: ${res.status}`);
  return res.json();
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


