import { useEffect, useState } from 'react';
import { calculateBMI, getBMICategory } from '@/lib/fitness-utils';

interface BMIIndicatorProps {
  weight: number;
  height: number;
}

export function BMIIndicator({ weight, height }: BMIIndicatorProps) {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const bmi = calculateBMI(weight, height);
  const category = getBMICategory(bmi);
  
  // Position calculation: BMI 15-40 maps to 0-100%
  const minBMI = 15;
  const maxBMI = 40;
  const position = Math.max(0, Math.min(100, ((bmi - minBMI) / (maxBMI - minBMI)) * 100));

  const zones = [
    { label: 'Under', end: 18.5, color: 'bg-bmi-underweight' },
    { label: 'Normal', end: 25, color: 'bg-bmi-normal' },
    { label: 'Over', end: 30, color: 'bg-bmi-overweight' },
    { label: 'Obese', end: 40, color: 'bg-bmi-obese' },
  ];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="stat-label">BMI</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tabular-nums animate-value">{bmi.toFixed(1)}</span>
          <span className={`text-xs font-medium ${
            category.color === 'normal' ? 'text-bmi-normal' :
            category.color === 'underweight' ? 'text-bmi-underweight' :
            category.color === 'overweight' ? 'text-bmi-overweight' :
            'text-bmi-obese'
          }`}>
            {category.label}
          </span>
        </div>
      </div>

      {/* BMI Bar */}
      <div className="relative h-3 rounded-full overflow-hidden flex">
        {zones.map((zone, i) => {
          const prevEnd = i === 0 ? minBMI : zones[i - 1].end;
          const width = ((zone.end - prevEnd) / (maxBMI - minBMI)) * 100;
          return (
            <div
              key={zone.label}
              className={`${zone.color} h-full`}
              style={{ width: `${width}%` }}
            />
          );
        })}
        
        {/* Indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ 
            left: `${animated ? position : 50}%`,
            transform: `translateX(-50%) translateY(-50%)`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-foreground border-2 border-background shadow-lg" />
        </div>
      </div>

      {/* Zone labels */}
      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
        <span>15</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>40</span>
      </div>
    </div>
  );
}
