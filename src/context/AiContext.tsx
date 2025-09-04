import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { aiChat, buildTaskContext, ChatMessage, parseSuggestedTasksFromText, SuggestedTask } from "@/lib/ai";
import { useData } from "@/context/DataContext";

type AiContextValue = {
  messages: ChatMessage[];
  isLoading: boolean;
  ask: (input: string) => Promise<void>;
  askAndReturn: (input: string) => Promise<string>;
  summarizeTasks: () => Promise<string>;
  generateTasksFromGoal: (goal: string) => Promise<{ text: string; suggestions: SuggestedTask[] }>;
  analyzeSubscriptions: () => Promise<{ summary: string; suggestions: SuggestedTask[] }>;
  refineTask: (title: string, description?: string) => Promise<{ title?: string; description?: string }>;
  splitTask: (title: string, description?: string) => Promise<SuggestedTask[]>;
  clear: () => void;
};

const AiContext = createContext<AiContextValue | undefined>(undefined);

export const AiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentBusiness, tasksForSelected, subsForSelected } = useData();
  const [messagesByBusiness, setMessagesByBusiness] = useState<Record<string, ChatMessage[]>>({});
  const [currentBusinessId, setCurrentBusinessId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Switch chat context when business changes
  useEffect(() => {
    if (currentBusiness?.id && currentBusiness.id !== currentBusinessId) {
      setCurrentBusinessId(currentBusiness.id);
    }
  }, [currentBusiness?.id, currentBusinessId]);

  // Get messages for current business
  const messages = currentBusinessId ? (messagesByBusiness[currentBusinessId] || []) : [];

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
    if (isLoading || !currentBusinessId) return ""; // prevent double-trigger
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
      const choice = data?.choices?.[0];
      let text = choice?.message?.content || "";
      if (!text || text.trim().length < 3) {
        // One automatic retry with a simplified prompt
        const retry = options?.retryModelText || modelText;
        const retryMsgs: ChatMessage[] = [baseSystem, { role: "system", content: ctx }, { role: "user", content: retry }];
        const data2 = await aiChat(retryMsgs, { temperature: options?.temperature ?? 0.2 });
        const c2 = data2?.choices?.[0];
        text = c2?.message?.content || "";
      }
      
      const userMsg = { role: "user" as const, content: displayText };
      const assistantMsg = { role: "assistant" as const, content: text };
      setMessagesByBusiness(prev => ({ 
        ...prev, 
        [currentBusinessId]: [...(prev[currentBusinessId] || []), userMsg, assistantMsg] 
      }));
      
      return text;
    } catch (err: any) {
      const message = typeof err?.message === "string" ? err.message : "Unknown error";
      const userMsg = { role: "user" as const, content: displayText };
      const errorMsg = { role: "assistant" as const, content: `Sorry, I couldn't complete the request (${message}). Ensure the AI proxy is running and the API key is set.` };
      setMessagesByBusiness(prev => ({ 
        ...prev, 
        [currentBusinessId]: [...(prev[currentBusinessId] || []), userMsg, errorMsg] 
      }));
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  const ask = async (input: string): Promise<void> => { await askInternal(input, input); };
  const askAndReturn = async (input: string): Promise<string> => { return await askInternal(input, input); };

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
    const text = await askInternal(display, model, { temperature: 0.2, retryModelText: retry });
    const suggestions = parseSuggestedTasksFromText(text);
    return { text, suggestions };
  };

  const clear = () => {
    if (currentBusinessId) {
      setMessagesByBusiness(prev => ({ ...prev, [currentBusinessId]: [] }));
    }
  };

  const value: AiContextValue = {
    messages,
    isLoading,
    ask,
    askAndReturn,
    summarizeTasks,
    generateTasksFromGoal,
    analyzeSubscriptions: async () => {
      const subs = subsForSelected;
      const totalMonthlyCost = subs.reduce((sum, s) => {
        const monthlyCost = s.cycle === "yearly" ? s.cost / 12 : 
                           s.cycle === "quarterly" ? s.cost / 3 : s.cost;
        return sum + monthlyCost;
      }, 0);
      
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
        `Analyze subscriptions for ${currentBusiness?.name || "this business"}. ` +
        `Current subscriptions: ${subs.length} total, estimated ${totalMonthlyCost.toFixed(2)} monthly cost.\n` +
        `Upcoming renewals (30d):\n${upcoming || "(none)"}\n\n` +
        `Provide a brief analysis of costs and renewal timeline in conversational text. ` +
        `Then suggest specific actionable tasks for managing these subscriptions. ` +
        `List tasks as simple numbered items (1. Task title - Description). No JSON or code blocks.`;
      
      const reply = await askInternal(display, model, { temperature: 0.2 });
      
      // Clean any potential code artifacts
      const cleanedReply = reply.replace(/```[^`]*```/g, '').replace(/\{[^}]*\}/g, '').trim();
      const suggestions = parseSuggestedTasksFromText(reply);
      
      const fallbackSummary = upcoming
        ? `You have ${subs.length} active subscriptions with estimated ${totalMonthlyCost.toFixed(2)} monthly cost.\n\nUpcoming renewals (30 days):\n${upcoming}`
        : `You have ${subs.length} active subscriptions with estimated ${totalMonthlyCost.toFixed(2)} monthly cost.\n\nNo renewals in the next 30 days.`;
      
      return { 
        summary: cleanedReply && cleanedReply.length > 10 ? cleanedReply : fallbackSummary, 
        suggestions 
      };
    },
    refineTask: async (title: string, description?: string) => {
      const display = "Refine task title and description";
      const model =
        `Refine the following task title and description for clarity and brevity:\n` +
        `Title: ${title}\nDescription: ${description || ""}\n\n` +
        `Provide improved versions in this format:\n` +
        `Title: [improved title]\n` +
        `Description: [improved description]\n\n` +
        `Use clear, actionable language. Do not include JSON or code blocks.`;
      const text = await askInternal(display, model, { temperature: 0.2 });
      
      // Clean any potential code artifacts
      const cleanedText = text.replace(/```[^`]*```/g, '').replace(/\{[^}]*\}/g, '').trim();
      
      // Parse title and description from the response
      const tMatch = cleanedText.match(/title\s*:\s*(.+)/i);
      const dMatch = cleanedText.match(/description\s*:\s*([\s\S]+)/i);
      
      return {
        title: tMatch && tMatch[1] ? tMatch[1].trim().replace(/\n.*/, '') : title,
        description: dMatch && dMatch[1] ? dMatch[1].trim() : description
      };
    },
    splitTask: async (title: string, description?: string) => {
      const display = "Split task into subtasks";
      const model =
        `Split the following task into 3-7 concrete subtasks:\n` +
        `Task: ${title}\nDetails: ${description || ""}\n\n` +
        `List each subtask as numbered items:\n` +
        `1. Subtask title - Brief description\n` +
        `2. Subtask title - Brief description\n` +
        `etc.\n\n` +
        `Use clear, actionable language. Do not include JSON or code blocks.`;
      const text = await askInternal(display, model, { temperature: 0.2 });
      return parseSuggestedTasksFromText(text);
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