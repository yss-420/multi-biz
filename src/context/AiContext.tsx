import React, { createContext, useContext, useMemo, useState } from "react";
import { aiChat, buildTaskContext, ChatMessage, parseSuggestedTasksFromText, SuggestedTask } from "@/lib/ai";
import { useData } from "@/context/DataContext";

type AiContextValue = {
  messages: ChatMessage[];
  isLoading: boolean;
  ask: (input: string) => Promise<void>;
  summarizeTasks: () => Promise<string>;
  generateTasksFromGoal: (goal: string) => Promise<unknown>;
  analyzeSubscriptions: () => Promise<{ summary: string; suggestions: SuggestedTask[] }>;
  clear: () => void;
};

const AiContext = createContext<AiContextValue | undefined>(undefined);

export const AiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentBusiness, tasksForSelected, subsForSelected } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const baseSystem: ChatMessage = useMemo(() => (
    {
      role: "system",
      content:
        [
          "You are MultiBiz AI, an operations copilot.",
          "Respond in plain conversational text. Do not use markdown, code blocks, or JSON unless explicitly asked.",
          "Do not echo the user's prompt. Be concise and helpful.",
          "When listing steps, use a short numbered list (1., 2., 3.).",
          "Dates should be readable (e.g., 2025-08-15 or 'tomorrow').",
        ].join("\n")
    }
  ), []);

  const askInternal = async (
    displayText: string,
    modelText: string,
    options?: { temperature?: number; retryModelText?: string }
  ): Promise<string> => {
    if (isLoading) return ""; // prevent double-trigger
    const ctx = buildTaskContext({ businessName: currentBusiness?.name, tasks: tasksForSelected });
    const msgs: ChatMessage[] = [
      baseSystem,
      { role: "system", content: ctx },
      { role: "user", content: modelText },
    ];
    setIsLoading(true);
    try {
      const temp = options?.temperature ?? 0.2;
      const data = await aiChat(msgs, { temperature: temp });
      const choice = data?.choices?.[0] || {};
      let text =
        choice?.message?.content ??
        choice?.delta?.content ??
        choice?.text ??
        "";
      if (!text || text.trim().length < 3) {
        // One automatic retry with a simplified prompt
        const retry = options?.retryModelText || modelText;
        const retryMsgs: ChatMessage[] = [baseSystem, { role: "system", content: ctx }, { role: "user", content: retry }];
        const data2 = await aiChat(retryMsgs, { temperature: options?.temperature ?? 0.2 });
        const c2 = data2?.choices?.[0] || {};
        text = c2?.message?.content ?? c2?.delta?.content ?? c2?.text ?? "";
      }
      setMessages((m) => [...m, { role: "user", content: displayText }, { role: "assistant", content: text }]);
      return text;
    } catch (err: any) {
      const message = typeof err?.message === "string" ? err.message : "Unknown error";
      setMessages((m) => [
        ...m,
        { role: "user", content: displayText },
        { role: "assistant", content: `Sorry, I couldn't complete the request (${message}). Ensure the AI proxy is running and the API key is set.` },
      ]);
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  const ask = async (input: string): Promise<void> => { await askInternal(input, input); };

  const summarizeTasks = async () => {
    const display = "Summarize my current tasks and suggest the top 3 next steps.";
    const model =
      "Summarize the user's current tasks (list up to 2) and propose the top 3 next steps. " +
      "Output EXACTLY this structure with new lines and nothing else: \n" +
      "Current tasks:\n1) <task one>\n2) <task two>\n\nNext steps:\n1) <step one>\n2) <step two>\n3) <step three>" +
      "\nUse short phrases. Do not echo the prompt.";
    const retry =
      "Provide only the two-line 'Current tasks' and three-line 'Next steps' sections, each on separate lines as specified. No preamble.";
    await askInternal(display, model, { temperature: 0.1, retryModelText: retry });
    return display;
  };

  const generateTasksFromGoal = async (goal: string) => {
    const display = `Suggest tasks to achieve: ${goal}`;
    const model =
      `Propose 5 concrete tasks to achieve this goal: "${goal}". ` +
      `Respond as a concise numbered list (1. ... up to 5.), one task per line. ` +
      `Do not include code, JSON, or repeat the goal.`;
    const retry = `Return exactly five numbered lines (1. to 5.) with concise tasks. No extra text.`;
    await askInternal(display, model, { temperature: 0.2, retryModelText: retry });
    return display;
  };

  const clear = () => setMessages([]);

  const value: AiContextValue = {
    messages,
    isLoading,
    ask,
    summarizeTasks,
    generateTasksFromGoal,
    analyzeSubscriptions: async () => {
      const subs = subsForSelected;
      const upcoming = subs
        .filter((s) => {
          const d = new Date(s.renewalDate).getTime();
          const now = Date.now();
          return d >= now && d <= now + 30 * 86400000;
        })
        .map((s) => `${s.serviceName} (${s.cycle}) – ${s.currency} ${s.cost} due ${new Date(s.renewalDate).toISOString().slice(0,10)}`)
        .join("\n");
      const display = "Analyze subscriptions and prepare tasks for upcoming renewals";
      const model =
        `You are helping plan renewals for ${currentBusiness?.name || "this business"}. ` +
        `Upcoming renewals (30d):\n${upcoming || "(none)"}\n` +
        `Provide a brief plain-text summary and then propose up to 5 actionable tasks in this JSON shape only: {"tasks":[{"title":"...","description":"...","priority":"low|medium|high","dueDate":"YYYY-MM-DD"}]}.`;
      const reply = await askInternal(display, model, { temperature: 0.2 });
      const suggestions = parseSuggestedTasksFromText(reply);
      const fallback = upcoming
        ? `Upcoming renewals (30 days):\n${upcoming}`
        : "No renewals in the next 30 days.";
      const summary = reply && reply.trim().length > 0 ? reply : fallback;
      return { summary, suggestions };
    },
    clear,
  };

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
};

export const useAi = () => {
  const ctx = useContext(AiContext);
  if (!ctx) throw new Error("useAi must be used within AiProvider");
  return ctx;
};


