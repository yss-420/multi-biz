import { useEffect, useMemo, useState } from "react";
import { useData, ApiKey } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { RequireOwner } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VaultContent() {
  const { apiKeys, removeApiKey, addApiKey, currentBusiness } = useData();
  const { requirePasswordCheck } = useAuth();
  const [revealId, setRevealId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [password, setPassword] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSms, setOtpSms] = useState("");
  const [codes, setCodes] = useState<{ email: string; sms: string } | null>(null);
  const [newKey, setNewKey] = useState<Omit<ApiKey, "id" | "createdAt">>({
    businessId: currentBusiness?.id || "",
    label: "",
    provider: "",
    secret: "",
    lastUsedAt: undefined,
  });

  useEffect(() => {
    document.title = `API Vault – ${currentBusiness?.name ?? "MultiBiz"}`;
  }, [currentBusiness?.name]);

  useEffect(() => {
    if (currentBusiness?.id) setNewKey((k) => ({ ...k, businessId: currentBusiness.id! }));
  }, [currentBusiness?.id]);

  const masked = (s: string) => (s.length <= 6 ? "•••" : `${s.slice(0, 3)}••••••${s.slice(-3)}`);

  const openReveal = (id: string) => {
    setRevealId(id);
    setStep(1);
    setPassword("");
    setCodes(null);
    setOtpEmail("");
    setOtpSms("");
  };

  const sendOtps = () => {
    const gen = () => Math.floor(100000 + Math.random() * 900000).toString();
    const email = gen();
    const sms = gen();
    setCodes({ email, sms });
    // Demo only: surface codes in UI (in production these are sent via backend)
    alert(`Demo OTPs — Email: ${email} | SMS: ${sms}`);
  };

  const canProceed2 = useMemo(() => requirePasswordCheck(password), [password, requirePasswordCheck]);
  const canReveal = useMemo(() => codes && otpEmail === codes.email && otpSms === codes.sms, [codes, otpEmail, otpSms]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Vault</h1>
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-3 gap-2"></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {apiKeys.map((k) => (
          <Card key={k.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{k.label}</div>
                <div className="text-sm text-muted-foreground">{k.provider || "Other"}</div>
              </div>
              <div className="text-xs text-green-400">Secure</div>
            </div>
            <div className="text-sm select-all">{masked(k.secret)}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => openReveal(k.id)}>Reveal</Button>
              <Button variant="secondary" size="sm" onClick={() => removeApiKey(k.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 space-y-3">
        <div className="font-semibold">Add API Key</div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label>Label</Label>
            <Input value={newKey.label} onChange={(e) => setNewKey({ ...newKey, label: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <Label>Provider</Label>
            <Input value={newKey.provider} onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })} />
          </div>
          <div className="md:col-span-2 grid gap-1">
            <Label>Secret</Label>
            <Input value={newKey.secret} onChange={(e) => setNewKey({ ...newKey, secret: e.target.value })} />
          </div>
        </div>
        <Button onClick={() => addApiKey(newKey)}>Save Key</Button>
      </Card>

      <Dialog open={!!revealId} onOpenChange={(o) => !o && setRevealId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Security Check</DialogTitle>
          </DialogHeader>
          {step === 1 && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Re-enter your password to continue.</div>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <DialogFooter>
                <Button disabled={!canProceed2} onClick={() => setStep(2)}>Continue</Button>
              </DialogFooter>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Enter the OTPs sent to your email and SMS.</div>
              <Button variant="secondary" onClick={sendOtps}>Send OTPs</Button>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label>Email OTP</Label>
                  <Input value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label>SMS OTP</Label>
                  <Input value={otpSms} onChange={(e) => setOtpSms(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={!canReveal} onClick={() => setStep(3)}>Verify</Button>
              </DialogFooter>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Key revealed (demo only):</div>
              <div className="p-3 rounded-md border font-mono text-sm">
                {apiKeys.find((k) => k.id === revealId)?.secret}
              </div>
              <DialogFooter>
                <Button onClick={() => setRevealId(null)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function VaultPage() {
  return (
    <RequireOwner>
      <VaultContent />
    </RequireOwner>
  );
}
