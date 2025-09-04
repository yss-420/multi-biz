import { useState } from "react";
import { useAi } from "@/context/AiContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X } from "lucide-react";

export default function AiChat() {
  const { messages, isLoading, ask, summarizeTasks, generateTasksFromGoal } = useAi();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  return (
    <>
      <button
        aria-label="Open AI Assistant"
        className="fixed bottom-5 right-5 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="m-auto h-5 w-5" /> : <MessageSquare className="m-auto h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 w-[min(420px,92vw)] z-50">
          <Card className="p-3 space-y-3 shadow-xl animate-enter">
            <div className="flex items-center justify-between">
              <div className="font-semibold">MultiBiz AI</div>
              <div className="text-xs text-muted-foreground" aria-hidden>
                {/* intentionally empty to remove model label */}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="secondary" onClick={summarizeTasks} disabled={isLoading}>Summarize tasks</Button>
              <Button size="sm" variant="secondary" onClick={() => generateTasksFromGoal("Ship onboarding flow")} disabled={isLoading}>Suggest tasks</Button>
            </div>

              <div className="h-64 overflow-auto rounded border p-2 bg-background">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">Ask me to summarize tasks or propose next steps.</div>
              )}
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                     <div className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
                       m.role === "user" 
                         ? "bg-primary text-primary-foreground" 
                         : "bg-card border text-card-foreground"
                     }`}>
                       <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                         {m.content}
                       </div>
                      <div className={`text-xs mt-1 opacity-70 ${
                        m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {m.role === "user" ? "You" : "MultiBiz AI"}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card border rounded-lg px-3 py-2 shadow-sm">
                      <div className="text-sm text-muted-foreground">Thinking…</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim()) return;
                ask(input.trim());
                setInput("");
              }}
              className="flex gap-2"
            >
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask MultiBiz AI…" />
              <Button type="submit" disabled={isLoading}>Send</Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}


