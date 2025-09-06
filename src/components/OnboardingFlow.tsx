import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
import { Building2, User, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

export default function OnboardingFlow() {
  const { profile } = useAuth();
  const { addBusiness, selectBusiness } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [businessColor, setBusinessColor] = useState("biz-blue");
  const [loading, setLoading] = useState(false);

  const colors = [
    { id: "biz-blue", name: "Ocean Blue", class: "bg-blue-500" },
    { id: "biz-purple", name: "Royal Purple", class: "bg-purple-500" },
    { id: "biz-green", name: "Forest Green", class: "bg-green-500" },
    { id: "biz-red", name: "Crimson Red", class: "bg-red-500" },
    { id: "biz-yellow", name: "Golden Yellow", class: "bg-yellow-500" }
  ];

  const handleCreateBusiness = async () => {
    if (!businessName.trim()) {
      toast({ variant: "destructive", title: "Business name is required" });
      return;
    }

    setLoading(true);
    try {
      const business = addBusiness(businessName.trim(), businessColor);
      selectBusiness(business.id);
      
      toast({
        title: "Welcome to MultiBiz!",
        description: `${business.name} has been created successfully.`
      });

      // Small delay for better UX
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating business",
        description: "Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  i <= step 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {i < step ? <CheckCircle className="h-5 w-5" /> : i}
                </div>
                {i < 3 && (
                  <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                    i < step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-8 backdrop-blur-sm bg-card/80 border shadow-2xl">
          {step === 1 && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome to MultiBiz!
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Hey {profile?.name || 'there'}! Let's get you set up with your first business empire.
              </p>
              <div className="pt-4">
                <Button onClick={nextStep} size="lg" className="px-8">
                  Let's Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">You're the Owner</h2>
                <p className="text-muted-foreground">
                  As the business owner, you'll have full control over your operations, team, and settings.
                </p>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6 border">
                <h3 className="font-semibold mb-3">Owner Benefits:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Manage multiple businesses from one dashboard",
                    "Add and manage team members",
                    "Access to all premium features",
                    "Complete control over business settings"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-center">
                <Button onClick={nextStep} size="lg" className="px-8">
                  Continue as Owner <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Create Your First Business</h2>
                <p className="text-muted-foreground">
                  Let's set up your first business to get you started on your empire journey.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., Acme Corporation"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="text-center text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Choose a Color Theme</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setBusinessColor(color.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          businessColor === color.id 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${color.class}`} />
                        <p className="text-xs font-medium">{color.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleCreateBusiness} 
                  size="lg" 
                  className="px-8"
                  disabled={loading || !businessName.trim()}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </div>
                  ) : (
                    <>
                      Create Business <Building2 className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}