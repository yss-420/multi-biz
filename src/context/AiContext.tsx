import React, { createContext, useContext, useMemo, useState } from "react";
import { aiChat, buildTaskContext, ChatMessage } from "@/lib/ai";
import { useData } from "@/context/DataContext";

type AiContextValue = {
  messages: ChatMessage[];
  isLoading: boolean;
  ask: (input: string) => Promise<void>;
  summarizeTasks: () => Promise<string>;
  generateTasksFromGoal: (goal: string) => Promise<unknown>;
  clear: () => void;
};

const AiContext = createContext<AiContextValue | undefined>(undefined);

export const AiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentBusiness, tasksForSelected } = useData();
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

  const askInternal = async (displayText: string, modelText: string, options?: { temperature?: number }) => {
    if (isLoading) return; // prevent double-trigger
    const ctx = buildTaskContext({ businessName: currentBusiness?.name, tasks: tasksForSelected });
    const msgs: ChatMessage[] = [
      baseSystem,
      { role: "system", content: ctx },
      { role: "user", content: modelText },
    ];
    setIsLoading(true);
    try {
      const data = await aiChat(msgs, { temperature: options?.temperature });
      const choice = data?.choices?.[0] || {};
      const text =
        choice?.message?.content ??
        choice?.delta?.content ??
        choice?.text ??
        "";
      setMessages((m) => [...m, { role: "user", content: displayText }, { role: "assistant", content: text }]);
    } catch (err: any) {
      const message = typeof err?.message === "string" ? err.message : "Unknown error";
      setMessages((m) => [
        ...m,
        { role: "user", content: displayText },
        { role: "assistant", content: `Sorry, I couldn't complete the request (${message}). Ensure the AI proxy is running and the API key is set.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const ask = async (input: string) => askInternal(input, input);

  const summarizeTasks = async () => {
    const display = "Summarize my current tasks and suggest the top 3 next steps.";
    const model =
      "Summarize the user's current tasks (list up to 2) and propose the top 3 next steps. " +
      "Output EXACTLY this structure with new lines and nothing else: \n" +
      "Current tasks:\n1) <task one>\n2) <task two>\n\nNext steps:\n1) <step one>\n2) <step two>\n3) <step three>" +
      "\nUse short phrases. Do not echo the prompt.";
    await askInternal(display, model, { temperature: 0.1 });
    return display;
  };

  const generateTasksFromGoal = async (goal: string) => {
    const display = `Suggest tasks to achieve: ${goal}`;
    const model =
      `Propose 3-7 concrete tasks to achieve this goal: "${goal}". ` +
      `Respond as a concise numbered list, one task per line. ` +
      `Do not include code, JSON, or repeat the goal.`;
    await askInternal(display, model);
    return display;
  };

  const clear = () => setMessages([]);

  const value: AiContextValue = {
    messages,
    isLoading,
    ask,
    summarizeTasks,
    generateTasksFromGoal,
    clear,
  };

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
};

export const useAi = () => {
  const ctx = useContext(AiContext);
  if (!ctx) throw new Error("useAi must be used within AiProvider");
  return ctx;
};


