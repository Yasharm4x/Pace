import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import {
  DailyEntry,
  UserProfile,
  calculateWeeklyLossRate,
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

export function ProjectionCard({
  entries,
  profile,
  currentWeight,
}: ProjectionCardProps) {
  const projectionData = useMemo(() => {
    const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

    // --- Normalize dates (Safari-safe) ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goalDate = new Date(profile.goalDate);
    goalDate.setHours(0, 0, 0, 0);

    const diffMs = goalDate.getTime() - today.getTime();

    const weeksRemaining =
      diffMs > 0 ? Math.ceil(diffMs / MS_PER_WEEK) : 0;

    // --- Weights ---
    const weightRemaining = Math.max(
      0,
      currentWeight - profile.targetWeight
    );

    // --- Actual weekly loss rate ---
    const weeklyRate = calculateWeeklyLossRate(entries);

    // --- Required weekly loss rate ---
    const requiredRate =
      weeksRemaining > 0 && weightRemaining > 0
        ? +(weightRemaining / weeksRemaining).toFixed(2)
        : null;

    // --- Projected goal date ---
    const projectedDate =
      weeklyRate && weeklyRate > 0
        ? calculateProjectedGoalDate(
            currentWeight,
            profile.targetWeight,
            weeklyRate
          )
        : null;

    // --- Status ---
    const status =
      weeklyRate !== null && requiredRate !== null
        ? getProgressStatus(weeklyRate, requiredRate)
        : {
            status: 'on-track' as const,
            label: 'Getting started',
            color: 'primary' as const,
          };

    // --- Insight ---
    const insight = generateInsight(
      currentWeight,
      profile.targetWeight,
      weeklyRate,
      requiredRate,
      projectedDate,
      goalDate
    );

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

  const StatusIcon =
    projectionData.status.status === 'ahead'
      ? TrendingUp
      : projectionData.status.status === 'behind'
      ? TrendingDown
      : Target;

  const statusColors = {
    ahead: 'bg-success/10 text-success border-success/20',
    'on-track': 'bg-primary/10 text-primary border-primary/20',
    behind: 'bg-warning/10 text-warning border-warning/20',
  };

  return (
    <div className="glass-card-elevated p-5">
      {/* Status badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            statusColors[projectionData.status.status]
          }`}
        >
          <StatusIcon size={14} />
          {projectionData.status.label}
        </div>

        {projectionData.projectedDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>
              Goal:{' '}
              {formatDate(
                projectionData.projectedDate,
                'short'
              )}
            </span>
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
            {projectionData.requiredRate !== null
              ? projectionData.requiredRate.toFixed(2)
              : '--'}
          </div>
          <div className="stat-label mt-1">
            {projectionData.requiredRate !== null
              ? 'kg/week'
              : 'set goal date'}
          </div>
        </div>
      </div>

      {/* Current pace indicator */}
      {projectionData.weeklyRate !== null &&
        projectionData.requiredRate !== null && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Your current pace
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {projectionData.weeklyRate.toFixed(2)} kg/week
                </span>
                <ArrowRight
                  size={12}
                  className="text-muted-foreground"
                />
                <span
                  className={`font-medium ${
                    projectionData.status.status === 'ahead'
                      ? 'text-success'
                      : projectionData.status.status === 'behind'
                      ? 'text-warning'
                      : 'text-primary'
                  }`}
                >
                  {projectionData.weeklyRate >=
                  projectionData.requiredRate
                    ? '+'
                    : ''}
                  {(
                    projectionData.weeklyRate -
                    projectionData.requiredRate
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
