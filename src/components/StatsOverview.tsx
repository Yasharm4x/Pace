import { useMemo } from 'react';
import { TrendingDown, Percent, Scale } from 'lucide-react';
import {
  DailyEntry,
  UserProfile,
  calculateBMI,
  calculateMovingAverage,
  estimateBodyFat,
} from '@/lib/fitness-utils';

interface StatsOverviewProps {
  entries: DailyEntry[];
  profile: UserProfile;
  currentWeight: number;
}

export function StatsOverview({ entries, profile, currentWeight }: StatsOverviewProps) {
  const stats = useMemo(() => {
    const bmi = calculateBMI(currentWeight, profile.height);
    const bodyFat = estimateBodyFat(bmi, profile.age);
    const weekAvg = calculateMovingAverage(entries, 7);
    const weightLost = profile.startingWeight - currentWeight;
    const progressPercent = (weightLost / (profile.startingWeight - profile.targetWeight)) * 100;

    return {
      bmi,
      bodyFat,
      weekAvg,
      weightLost,
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
    };
  }, [entries, profile, currentWeight]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Weight lost */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-success" />
          </div>
        </div>
        <div className="stat-value text-2xl text-success animate-value">
          {stats.weightLost > 0 ? '-' : ''}{Math.abs(stats.weightLost).toFixed(1)}
        </div>
        <div className="stat-label mt-1">kg lost</div>
      </div>

      {/* Progress */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Percent className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="stat-value text-2xl animate-value">
          {stats.progressPercent.toFixed(0)}%
        </div>
        <div className="stat-label mt-1">progress</div>
        {/* Mini progress bar */}
        <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Body fat estimate */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-ring-calories/10 flex items-center justify-center">
            <Percent className="w-4 h-4 text-ring-calories" />
          </div>
        </div>
        <div className="stat-value text-2xl animate-value">
          ~{stats.bodyFat.toFixed(0)}%
        </div>
        <div className="stat-label mt-1">body fat est.</div>
      </div>

      {/* 7-day average */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-ring-streak/10 flex items-center justify-center">
            <Scale className="w-4 h-4 text-ring-streak" />
          </div>
        </div>
        <div className="stat-value text-2xl animate-value">
          {stats.weekAvg?.toFixed(1) || '--'}
        </div>
        <div className="stat-label mt-1">7-day avg</div>
      </div>
    </div>
  );
}
