import { useEffect, useState } from 'react';

interface ActivityRingsProps {
  steps: number;
  stepsGoal: number;
  calories: number;
  caloriesGoal: number;
  streak: number;
  streakGoal?: number;
}

export function ActivityRings({
  steps,
  stepsGoal,
  calories,
  caloriesGoal,
  streak,
  streakGoal = 7,
}: ActivityRingsProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stepsProgress = Math.min(steps / stepsGoal, 1);
  const caloriesProgress = Math.min(calories / caloriesGoal, 1);
  const streakProgress = Math.min(streak / streakGoal, 1);

  const ringSize = 140;
  const strokeWidth = 14;
  const center = ringSize / 2;
  
  const outerRadius = center - strokeWidth / 2;
  const middleRadius = outerRadius - strokeWidth - 4;
  const innerRadius = middleRadius - strokeWidth - 4;

  const circumference = (radius: number) => 2 * Math.PI * radius;
  const offset = (radius: number, progress: number) => 
    circumference(radius) * (1 - (animated ? progress : 0));

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* SVG Gradients Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gradient-steps" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(160, 84%, 50%)" />
            <stop offset="100%" stopColor="hsl(140, 71%, 45%)" />
          </linearGradient>
          <linearGradient id="gradient-calories" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(340, 82%, 60%)" />
            <stop offset="100%" stopColor="hsl(320, 72%, 50%)" />
          </linearGradient>
          <linearGradient id="gradient-streak" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(199, 89%, 55%)" />
            <stop offset="100%" stopColor="hsl(210, 100%, 45%)" />
          </linearGradient>
        </defs>
      </svg>

      <svg 
        width={ringSize} 
        height={ringSize} 
        className="transform -rotate-90"
      >
        {/* Background rings */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        <circle
          cx={center}
          cy={center}
          r={middleRadius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />

        {/* Progress rings */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="url(#gradient-steps)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference(outerRadius)}
          strokeDashoffset={offset(outerRadius, stepsProgress)}
          className="animate-ring"
          style={{ filter: 'drop-shadow(0 0 6px hsl(160, 84%, 50%, 0.5))' }}
        />
        <circle
          cx={center}
          cy={center}
          r={middleRadius}
          fill="none"
          stroke="url(#gradient-calories)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference(middleRadius)}
          strokeDashoffset={offset(middleRadius, caloriesProgress)}
          className="animate-ring"
          style={{ 
            filter: 'drop-shadow(0 0 6px hsl(340, 82%, 60%, 0.5))',
            transitionDelay: '100ms'
          }}
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="url(#gradient-streak)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference(innerRadius)}
          strokeDashoffset={offset(innerRadius, streakProgress)}
          className="animate-ring"
          style={{ 
            filter: 'drop-shadow(0 0 6px hsl(199, 89%, 55%, 0.5))',
            transitionDelay: '200ms'
          }}
        />
      </svg>

      {/* Ring labels */}
      <div className="flex gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-ring-steps" />
          <span className="text-muted-foreground">Steps</span>
          <span className="text-foreground font-medium">{steps.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-ring-calories" />
          <span className="text-muted-foreground">Cal</span>
          <span className="text-foreground font-medium">{calories.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-ring-streak" />
          <span className="text-muted-foreground">Streak</span>
          <span className="text-foreground font-medium">{streak}d</span>
        </div>
      </div>
    </div>
  );
}
