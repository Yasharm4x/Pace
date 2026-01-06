import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, Calendar, ArrowRight } from 'lucide-react';
import {
  DailyEntry,
  UserProfile,
  calculateWeeklyLossRate,
  calculateRequiredWeeklyLoss,
  calculateProjectedGoalDate,
  getProgressStatus,
  generateInsight,
  formatDate,
} from '@/lib/fitness-utils';

interface ProjectionCardProps {
  entries: DailyEntry[];
  profile: UserProfile;
  currentWeight: number;
}

export function ProjectionCard({ entries, profile, currentWeight }: ProjectionCardProps) {
  const projectionData = useMemo(() => {
    const weeklyRate = calculateWeeklyLossRate(entries);
    const requiredRate = calculateRequiredWeeklyLoss(
      currentWeight,
      profile.targetWeight,
      profile.goalDate
    );
    const projectedDate = weeklyRate && weeklyRate > 0
      ? calculateProjectedGoalDate(currentWeight, profile.targetWeight, weeklyRate)
      : null;
    const status = weeklyRate
      ? getProgressStatus(weeklyRate, requiredRate)
      : { status: 'on-track' as const, label: 'Getting started', color: 'primary' as const };
    const insight = generateInsight(
      currentWeight,
      profile.targetWeight,
      weeklyRate,
      requiredRate,
      projectedDate,
      profile.goalDate
    );

    const weightRemaining = Math.max(0, currentWeight - profile.targetWeight);
    const goalDate = new Date(profile.goalDate);
    const today = new Date();
    const weeksRemaining = Math.max(0, Math.ceil((goalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)));

    return {
      weeklyRate,
      requiredRate,
      projectedDate,
      status,
      insight,
      weightRemaining,
      weeksRemaining,
    };
  }, [entries, profile, currentWeight]);

  const StatusIcon = projectionData.status.status === 'ahead' ? TrendingUp : 
                     projectionData.status.status === 'behind' ? TrendingDown : Target;

  const statusColors = {
    ahead: 'bg-success/10 text-success border-success/20',
    'on-track': 'bg-primary/10 text-primary border-primary/20',
    behind: 'bg-warning/10 text-warning border-warning/20',
  };

  return (
    <div className="glass-card-elevated p-5">
      {/* Status badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusColors[projectionData.status.status]}`}>
          <StatusIcon size={14} />
          {projectionData.status.label}
        </div>
        {projectionData.projectedDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>Goal: {formatDate(projectionData.projectedDate, 'short')}</span>
          </div>
        )}
      </div>

      {/* Main insight */}
      <p className="text-foreground text-sm leading-relaxed mb-5">
        {projectionData.insight}
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="stat-value text-2xl animate-value">
            {projectionData.weightRemaining.toFixed(1)}
          </div>
          <div className="stat-label mt-1">kg to go</div>
        </div>
        <div className="text-center">
          <div className="stat-value text-2xl animate-value">
            {projectionData.weeksRemaining}
          </div>
          <div className="stat-label mt-1">weeks left</div>
        </div>
        <div className="text-center">
          <div className="stat-value text-2xl animate-value">
            {projectionData.requiredRate.toFixed(2)}
          </div>
          <div className="stat-label mt-1">kg/week</div>
        </div>
      </div>

      {/* Current pace indicator */}
      {projectionData.weeklyRate !== null && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Your current pace</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{projectionData.weeklyRate.toFixed(2)} kg/week</span>
              <ArrowRight size={12} className="text-muted-foreground" />
              <span className={`font-medium ${
                projectionData.status.status === 'ahead' ? 'text-success' :
                projectionData.status.status === 'behind' ? 'text-warning' : 'text-primary'
              }`}>
                {projectionData.weeklyRate >= projectionData.requiredRate ? '+' : ''}
                {(projectionData.weeklyRate - projectionData.requiredRate).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
