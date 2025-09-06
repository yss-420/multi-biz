import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Users, Calendar, FileText } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "MultiBiz – Business Operations Hub";
  }, []);

  // If user is logged in, redirect to dashboard
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
          <Link to="/dashboard">
            <Button>Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">MultiBiz</h1>
          </div>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Manage Multiple Businesses
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive operations hub for managing subscriptions, tasks, notes, and team collaboration across all your business ventures.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 rounded-lg border bg-card">
            <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multi-Business</h3>
            <p className="text-muted-foreground">
              Manage multiple businesses from a single dashboard with role-based access control.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border bg-card">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Subscriptions</h3>
            <p className="text-muted-foreground">
              Track recurring subscriptions and get reminders for upcoming renewals.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border bg-card">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Team Tasks</h3>
            <p className="text-muted-foreground">
              Collaborate with your team on tasks and projects across all businesses.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border bg-card">
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Notes & Vault</h3>
            <p className="text-muted-foreground">
              Secure storage for business notes and API keys with encryption.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card border rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Ready to streamline your business operations?</h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of entrepreneurs who trust MultiBiz to manage their business operations efficiently.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 MultiBiz. Built with modern web technologies for optimal performance.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
