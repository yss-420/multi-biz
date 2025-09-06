import { useEffect, useMemo, useState } from "react";
import { useData, ApiKey } from "@/context/DataContext";
import { usePasswordCheck } from "@/hooks/usePasswordCheck";
import { RequireOwner } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

function VaultContent() {
  const { apiKeys, removeApiKey, addApiKey, decryptApiKey, loadBusinessApiKeys, currentBusiness } = useData();
  const { requirePasswordCheck } = usePasswordCheck();
  const { toast } = useToast();
  const [revealId, setRevealId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newKey, setNewKey] = useState({
    name: "",
    description: "",
    keyValue: "",
  });

  useEffect(() => {
    document.title = `API Vault – ${currentBusiness?.name ?? "MultiBiz"}`;
  }, [currentBusiness?.name]);

  // Load API keys when business changes
  useEffect(() => {
    if (currentBusiness?.id) {
      loadBusinessApiKeys(currentBusiness.id).catch(console.error);
    }
  }, [currentBusiness?.id, loadBusinessApiKeys]);

  const masked = (s: string) => (s.length <= 6 ? "•••" : `${s.slice(0, 3)}••••••${s.slice(-3)}`);

  const openReveal = (id: string) => {
    setRevealId(id);
    setStep(1);
    setPassword("");
  };

  const handleReveal = async () => {
    if (!revealId) return;
    
    try {
      setIsLoading(true);
      await decryptApiKey(revealId);
      setStep(2);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decrypt API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddApiKey = async () => {
    if (!newKey.name || !newKey.keyValue) {
      toast({
        title: "Error",
        description: "Name and API key are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await addApiKey(newKey.name, newKey.keyValue, newKey.description);
      setShowAddDialog(false);
      setNewKey({ name: "", description: "", keyValue: "" });
      toast({
        title: "Success",
        description: "API key added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      setIsLoading(true);
      await removeApiKey(id);
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canReveal = useMemo(() => requirePasswordCheck(password), [password, requirePasswordCheck]);

  const currentBusinessKeys = apiKeys.filter(k => k.businessId === currentBusiness?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          API Vault <Badge variant="secondary" className="text-xs">Total {currentBusinessKeys.length}</Badge>
        </h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add API Key
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-destructive">🔒 Security Notice</h2>
          <p className="text-sm text-muted-foreground">
            Your API keys are now encrypted and stored securely. Only authorized users can decrypt and view them. 
            Each decryption requires password verification for enhanced security.
          </p>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {currentBusinessKeys.map((k) => (
          <Card key={k.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{k.name}</h3>
                {k.description && (
                  <p className="text-sm text-muted-foreground">{k.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteApiKey(k.id)}
                disabled={isLoading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">API Key:</div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded border font-mono text-sm flex-1">
                  {k.isDecrypted && k.keyValue ? k.keyValue : "••••••••••••••••"}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => k.isDecrypted && k.keyValue ? 
                    navigator.clipboard.writeText(k.keyValue).then(() => toast({ title: "Copied!" })) :
                    openReveal(k.id)
                  }
                  disabled={isLoading}
                >
                  {k.isDecrypted ? <Copy className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add API Key Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                placeholder="e.g., OpenAI API Key"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newKey.description}
                onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div>
              <Label htmlFor="keyValue">API Key *</Label>
              <Textarea
                id="keyValue"
                value={newKey.keyValue}
                onChange={(e) => setNewKey({ ...newKey, keyValue: e.target.value })}
                placeholder="Paste your API key here"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddApiKey} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add API Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal API Key Dialog */}
      <Dialog open={!!revealId} onOpenChange={() => setRevealId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Required</DialogTitle>
          </DialogHeader>
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your password to decrypt and view this API key.
              </p>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canReveal && handleReveal()}
                />
              </div>
            </div>
          )}
          {step === 2 && revealId && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Decrypted API Key:</div>
              <div className="p-3 rounded-md border font-mono text-sm flex items-center justify-between gap-3">
                <span className="break-all">{apiKeys.find((k) => k.id === revealId)?.keyValue}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const keyValue = apiKeys.find((k) => k.id === revealId)?.keyValue;
                    if (keyValue) {
                      navigator.clipboard.writeText(keyValue);
                      toast({ title: "Copied!" });
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This key will remain decrypted in memory until you refresh the page.
              </p>
            </div>
          )}
          <DialogFooter>
            {step === 1 && (
              <>
                <Button variant="outline" onClick={() => setRevealId(null)}>
                  Cancel
                </Button>
                <Button onClick={handleReveal} disabled={!canReveal || isLoading}>
                  {isLoading ? "Decrypting..." : "Reveal Key"}
                </Button>
              </>
            )}
            {step === 2 && (
              <Button onClick={() => setRevealId(null)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Vault() {
  return (
    <RequireOwner>
      <VaultContent />
    </RequireOwner>
  );
}