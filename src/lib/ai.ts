export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function aiChat(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; max_tokens?: number }
) {
  console.log("Making AI request via edge function with:", { messages: messages.length, options });
  
  try {
    // Get user's API key from localStorage if available
    const userApiKey = localStorage.getItem('gemini_api_key');
    
    const response = await fetch(`https://oejljvdpdmcabferfcqj.supabase.co/functions/v1/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lamxqdmRwZG1jYWJmZXJmY3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTI0NjcsImV4cCI6MjA2OTI4ODQ2N30.b3Qe0Gn39YAmAqKcaHVwOYSseUsC3IYTIBayuOi6akI`
      },
      body: JSON.stringify({
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.max_tokens ?? 384,
        user_api_key: userApiKey,
      }),
    });

    const data = await response.json();
    console.log("Edge function response:", { status: response.status, data });

    if (!response.ok) {
      const errorMessage = data.error || `Edge function error: ${response.status}`;
      console.error("Edge function error:", errorMessage);
      throw new Error(errorMessage);
    }

    console.log("Successfully received AI response");
    return data;
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


