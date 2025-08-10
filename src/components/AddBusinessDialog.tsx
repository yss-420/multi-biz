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

  useEffect(() => {
    if (!open) {
      setName("");
      setPassword("");
    }
  }, [open]);

  const submit = () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Business name required" });
      return;
    }
    if (!requirePasswordCheck(password)) {
      toast({ variant: "destructive", title: "Incorrect password", description: "Please try again." });
      return;
    }
    const b = addBusiness(name.trim());
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
          <div className="grid gap-1">
            <Label>Business Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Acme Inc." />
          </div>
          <div className="grid gap-1">
            <Label>Confirm Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Add Business</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
