import { useEffect, useState } from "react";
import { Building2, Zap, Target, TrendingUp } from "lucide-react";

export const ScalingBusinessAnimation = () => {
  const [phase, setPhase] = useState<'initial' | 'scaling' | 'converged' | 'text'>('initial');

  useEffect(() => {
    const runAnimation = () => {
      setPhase('initial');
      const timer1 = setTimeout(() => setPhase('scaling'), 500);
      const timer2 = setTimeout(() => setPhase('converged'), 2500);
      const timer3 = setTimeout(() => setPhase('text'), 4000);
      const timer4 = setTimeout(() => runAnimation(), 7000); // Loop back

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    };

    const cleanup = runAnimation();
    return cleanup;
  }, []);

  const businesses = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 360) / 12;
    const radius = 180;
    return {
      id: i,
      delay: i * 80,
      initialX: Math.cos((angle * Math.PI) / 180) * radius,
      initialY: Math.sin((angle * Math.PI) / 180) * radius,
      icon: [Building2, Zap, Target, TrendingUp][i % 4],
      color: ['text-primary', 'text-secondary', 'text-accent', 'text-primary/80'][i % 4],
    };
  });

  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      {/* Business Icons */}
      {businesses.map((business) => {
        const IconComponent = business.icon;
        return (
          <div
            key={business.id}
            className={`absolute transition-all duration-1500 ease-in-out ${
              phase === 'initial' 
                ? 'opacity-0 scale-0 rotate-180' 
                : phase === 'scaling'
                ? 'opacity-90 scale-110 rotate-0'
                : phase === 'converged'
                ? 'opacity-100 scale-75 rotate-180'
                : 'opacity-20 scale-50'
            }`}
            style={{
              transform: phase === 'initial' || phase === 'text'
                ? 'translate(0, 0) rotate(0deg)'
                : phase === 'scaling'
                ? `translate(${business.initialX}px, ${business.initialY}px) rotate(360deg)`
                : `translate(0, 0) rotate(720deg)`,
              transitionDelay: `${business.delay}ms`,
            }}
          >
            <div className={`relative ${phase === 'converged' ? 'animate-pulse' : ''}`}>
              <IconComponent 
                className={`h-10 w-10 transition-all duration-1000 ${business.color} ${
                  phase === 'converged' 
                    ? 'drop-shadow-lg filter brightness-125' 
                    : 'drop-shadow-md'
                }`} 
              />
              {phase === 'converged' && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-ping" />
              )}
            </div>
          </div>
        );
      })}

      {/* Central Convergence Effects */}
      {phase === 'converged' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-2 border-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-20 h-20 border-2 border-secondary/30 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
          <div className="absolute w-12 h-12 border-2 border-primary rounded-full animate-pulse" />
          <div className="absolute w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin" />
        </div>
      )}

      {/* Energy Beams */}
      {phase === 'converged' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-20 bg-gradient-to-t from-transparent via-primary/50 to-transparent animate-pulse"
              style={{
                transform: `rotate(${i * 60}deg)`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      )}

      {/* Text Reveal with Enhanced Effects */}
      {phase === 'text' && (
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="relative">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in leading-tight">
              Transform Multiple Businesses Into Your Empire
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 blur-xl animate-pulse" />
            <p className="text-lg md:text-xl text-muted-foreground mt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              One Command Center. Infinite Possibilities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};