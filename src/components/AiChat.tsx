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
              <div className="space-y-2">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                      <div className={`inline-block rounded px-2 py-1 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary/20" : "bg-muted/60"}`}>
                        {m.content}
                      </div>
                  </div>
                ))}
                {isLoading && <div className="text-xs text-muted-foreground">Thinking…</div>}
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


