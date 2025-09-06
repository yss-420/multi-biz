import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

export const ScalingBusinessAnimation = () => {
  const [phase, setPhase] = useState<'initial' | 'scaling' | 'converged' | 'text'>('initial');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('scaling'), 500);
    const timer2 = setTimeout(() => setPhase('converged'), 2000);
    const timer3 = setTimeout(() => setPhase('text'), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const businesses = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 100,
    initialX: (i % 4) * 120 - 180,
    initialY: Math.floor(i / 4) * 80 - 40,
  }));

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
      {/* Business Icons */}
      {businesses.map((business) => (
        <div
          key={business.id}
          className={`absolute transition-all duration-1000 ease-in-out ${
            phase === 'initial' 
              ? 'opacity-0 scale-0' 
              : phase === 'scaling'
              ? 'opacity-100 scale-100'
              : phase === 'converged'
              ? 'opacity-100 scale-75'
              : 'opacity-0 scale-0'
          }`}
          style={{
            transform: phase === 'initial' || phase === 'text'
              ? 'translate(0, 0)'
              : phase === 'scaling'
              ? `translate(${business.initialX}px, ${business.initialY}px)`
              : 'translate(0, 0)',
            transitionDelay: `${business.delay}ms`,
          }}
        >
          <Building2 
            className={`h-8 w-8 transition-colors duration-500 ${
              phase === 'converged' 
                ? 'text-primary animate-pulse' 
                : 'text-secondary'
            }`} 
          />
        </div>
      ))}

      {/* Central Convergence Point */}
      {phase === 'converged' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-primary/30 rounded-full animate-ping" />
          <div className="absolute w-8 h-8 border-2 border-primary rounded-full animate-pulse" />
        </div>
      )}

      {/* Text Reveal */}
      {phase === 'text' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-fade-in">
            Your Personal Business Empire Command Center
          </h1>
        </div>
      )}
    </div>
  );
};