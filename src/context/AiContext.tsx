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
      content: "You are MultiBiz AI, a helpful operations copilot. Return concise answers. When proposing tasks, prefer a short actionable list."
    }
  ), []);

  const ask = async (input: string) => {
    const ctx = buildTaskContext({ businessName: currentBusiness?.name, tasks: tasksForSelected });
    const msgs: ChatMessage[] = [baseSystem, { role: "user", content: `${ctx}\n\nUser: ${input}` }];
    setIsLoading(true);
    try {
      const data = await aiChat(msgs);
      const text = data?.choices?.[0]?.message?.content || "";
      setMessages((m) => [...m, { role: "user", content: input }, { role: "assistant", content: text }]);
    } catch (err: any) {
      const message = typeof err?.message === "string" ? err.message : "Unknown error";
      setMessages((m) => [
        ...m,
        { role: "user", content: input },
        { role: "assistant", content: `Sorry, I couldn't complete the request (${message}). Ensure the AI proxy is running and the API key is set.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const summarizeTasks = async () => {
    const prompt = "Summarize my current tasks and suggest the top 3 next steps.";
    await ask(prompt);
    return prompt;
  };

  const generateTasksFromGoal = async (goal: string) => {
    const prompt = `Given this goal: "${goal}", propose 3-7 tasks as JSON under {\"tasks\":[{\"title\":...,\"description\":...,\"priority\":\"low|medium|high\",\"dueDate\":\"YYYY-MM-DD\"}]}.`;
    await ask(prompt);
    return prompt;
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


