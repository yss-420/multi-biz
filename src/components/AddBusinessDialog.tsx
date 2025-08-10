import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function AddBusinessDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addBusiness, selectBusiness } = useData();
  const { requirePasswordCheck } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [color, setColor] = useState<string>("biz-blue");
  const [step, setStep] = useState<1 | 2>(1);
  const colors = ["biz-red", "biz-green", "biz-yellow", "biz-blue", "biz-purple"];

  useEffect(() => {
    if (!open) {
      setName("");
      setPassword("");
      setColor("biz-blue");
      setStep(1);
    }
  }, [open]);

  const continueStep = () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Business name required" });
      return;
    }
    setStep(2);
  };

  const submit = () => {
    if (!requirePasswordCheck(password)) {
      toast({ variant: "destructive", title: "Incorrect password", description: "Please try again." });
      return;
    }
    const b = addBusiness(name.trim(), color);
    selectBusiness(b.id);
    toast({ title: "Business added", description: `${b.name} has been created.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="animate-enter">
        <DialogHeader>
          <DialogTitle>Add New Business</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {step === 1 ? (
            <>
              <div className="grid gap-1">
                <Label>Business Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Acme Inc." />
              </div>
              <div className="grid gap-1">
                <Label>Color</Label>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`h-8 w-8 rounded-full border ${color === c ? "ring-2 ring-primary" : ""}`}
                      style={{ backgroundColor: `hsl(var(--${c}))` }}
                      aria-label={`Select ${c}`}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-1">
              <Label>Confirm Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          {step === 1 ? (
            <Button onClick={continueStep}>Continue</Button>
          ) : (
            <Button onClick={submit}>Add Business</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
