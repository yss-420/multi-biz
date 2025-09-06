import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Users, Calendar, FileText, Sparkles, Zap, Globe, Shield } from "lucide-react";
import { ScalingBusinessAnimation } from "@/components/ScalingBusinessAnimation";

const Index = () => {
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.title = "MultiBiz – Business Operations Hub";
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // If user is logged in, redirect to dashboard
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
          <Link to="/dashboard">
            <Button className="hover-scale">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    );
  }

  const floatingElements = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background via-50% to-secondary/10 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse" />
        {floatingElements}
        
        {/* Enhanced Interactive Gradient Orb */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-primary/40 to-secondary/40 rounded-full blur-3xl transition-all duration-500 ease-out shadow-2xl shadow-primary/20"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transform: `translate(-50%, -50%) scale(${1 + mousePosition.x * 0.0002}) rotate(${mousePosition.x * 0.05}deg)`,
          }}
        />
        
        {/* Enhanced Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary/30 rounded-lg rotate-45 animate-spin shadow-lg shadow-primary/20" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-secondary/40 to-primary/40 rounded-full animate-bounce shadow-xl shadow-secondary/30" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/2 right-10 w-16 h-16 border-2 border-secondary/40 rounded-full animate-ping shadow-lg shadow-secondary/25" />
        
        {/* Additional floating elements with glow */}
        <div className="absolute top-32 left-1/4 w-4 h-4 bg-primary/60 rounded-full animate-bounce shadow-lg shadow-primary/40" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
        <div className="absolute bottom-32 right-1/4 w-3 h-3 bg-secondary/60 rounded-full animate-bounce shadow-lg shadow-secondary/40" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="w-full h-full bg-gradient-to-r from-primary to-secondary" style={{
            backgroundImage: 'linear-gradient(90deg, transparent 98%, hsl(var(--primary)) 100%), linear-gradient(180deg, transparent 98%, hsl(var(--primary)) 100%)',
            backgroundSize: '100px 100px'
          }} />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b bg-background/80 backdrop-blur-sm animate-fade-in">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 hover-scale">
            <div className="relative">
              <Building2 className="h-8 w-8 text-primary" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-secondary animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MultiBiz
            </h1>
          </div>
          <Link to="/auth">
            <Button variant="outline" className="hover-scale backdrop-blur-sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-enter">
          <div className="mb-12 animate-fade-in">
            <div className="relative mb-16 h-96 flex items-center justify-center">
              <ScalingBusinessAnimation />
            </div>
            
            <div className="space-y-8 px-6">
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4">
                The ultimate platform for managing multiple businesses, scaling operations, and building your entrepreneurial empire from one powerful dashboard.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Link to="/auth">
              <Button size="lg" className="px-10 py-6 text-lg hover-scale group relative overflow-hidden shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-0">
                <span className="relative z-10 flex items-center">
                  Launch Your Empire
                  <Building2 className="ml-3 h-6 w-6 transition-transform group-hover:scale-110" />
                </span>
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-10 py-6 text-lg hover-scale group border-2 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm hover:bg-primary/5">
              <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
              See It In Action
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { icon: Building2, title: "Multi-Business", desc: "Manage multiple businesses from a single dashboard with role-based access control.", delay: "0s" },
            { icon: Calendar, title: "Subscriptions", desc: "Track recurring subscriptions and get reminders for upcoming renewals.", delay: "0.1s" },
            { icon: Users, title: "Team Tasks", desc: "Collaborate with your team on tasks and projects across all businesses.", delay: "0.2s" },
            { icon: FileText, title: "Notes & Vault", desc: "Secure storage for business notes and API keys with encryption.", delay: "0.3s" }
          ].map(({ icon: Icon, title, desc, delay }, index) => (
            <div 
              key={index}
              className="group text-center p-8 rounded-xl border bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: delay }}
            >
              <div className="relative mb-6">
                <Icon className="h-16 w-16 text-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          {[
            { number: "10K+", label: "Active Users", icon: Users },
            { number: "50K+", label: "Businesses Managed", icon: Building2 },
            { number: "99.9%", label: "Uptime", icon: Zap },
            { number: "24/7", label: "Support", icon: Shield }
          ].map(({ number, label, icon: Icon }, index) => (
            <div key={index} className="text-center group hover-scale">
              <Icon className="h-8 w-8 text-primary mx-auto mb-2 group-hover:animate-pulse" />
              <div className="text-3xl font-bold text-primary mb-1">{number}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-card/80 to-card/60 border rounded-2xl p-12 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '1s' }}>
          <Globe className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" style={{ animationDuration: '20s' }} />
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ready to streamline your business operations?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of entrepreneurs who trust MultiBiz to manage their business operations efficiently.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-12 hover-scale bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl">
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-background/80 backdrop-blur-sm mt-16 animate-fade-in" style={{ animationDelay: '1.2s' }}>
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 MultiBiz. Built with modern web technologies for optimal performance.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
