// Fitness calculation utilities

export interface UserProfile {
  age: number;
  height: number; // cm
  startingWeight: number; // kg
  targetWeight: number; // kg
  startDate: string; // ISO date
  goalDate: string; // ISO date
  dailyStepGoal: number;
  dailyCalorieGoal: number;
}

export interface DailyEntry {
  date: string; // ISO date
  weight?: number;
  steps?: number;
  caloriesBurned?: number;
  timestamp: number;
}

export interface FitnessData {
  profile: UserProfile | null;
  entries: DailyEntry[];
  lastSaved: number | null;
}

// Calculate BMI
export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

// Get BMI category
export function getBMICategory(bmi: number): {
  label: string;
  color: 'underweight' | 'normal' | 'overweight' | 'obese';
} {
  if (bmi < 18.5) return { label: 'Underweight', color: 'underweight' };
  if (bmi < 25) return { label: 'Normal', color: 'normal' };
  if (bmi < 30) return { label: 'Overweight', color: 'overweight' };
  return { label: 'Obese', color: 'obese' };
}

// Estimate body fat percentage (US Navy formula approximation)
export function estimateBodyFat(bmi: number, age: number, isMale: boolean = true): number {
  // Simplified Deurenberg formula
  const bodyFat = (1.2 * bmi) + (0.23 * age) - (10.8 * (isMale ? 1 : 0)) - 5.4;
  return Math.max(5, Math.min(50, bodyFat));
}

// Calculate 7-day moving average
export function calculateMovingAverage(entries: DailyEntry[], days: number = 7): number | null {
  const weightEntries = entries
    .filter(e => e.weight !== undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, days);
  
  if (weightEntries.length === 0) return null;
  
  const sum = weightEntries.reduce((acc, e) => acc + (e.weight || 0), 0);
  return sum / weightEntries.length;
}

// Calculate weekly weight loss rate
export function calculateWeeklyLossRate(entries: DailyEntry[]): number | null {
  const weightEntries = entries
    .filter(e => e.weight !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (weightEntries.length < 2) return null;
  
  const first = weightEntries[0];
  const last = weightEntries[weightEntries.length - 1];
  
  const daysDiff = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff < 1) return null;
  
  const weightDiff = (first.weight || 0) - (last.weight || 0);
  const weeklyRate = (weightDiff / daysDiff) * 7;
  
  return weeklyRate;
}

// Calculate required weekly loss to hit goal
export function calculateRequiredWeeklyLoss(
  currentWeight: number,
  targetWeight: number,
  goalDate: string
): number {
  const today = new Date();
  const goal = new Date(goalDate);
  const daysRemaining = Math.max(1, (goal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const weeksRemaining = daysRemaining / 7;
  const weightToLose = currentWeight - targetWeight;
  
  return weightToLose / weeksRemaining;
}

// Calculate projected goal date based on current pace
export function calculateProjectedGoalDate(
  currentWeight: number,
  targetWeight: number,
  weeklyLossRate: number
): Date | null {
  if (weeklyLossRate <= 0) return null;
  
  const weightToLose = currentWeight - targetWeight;
  if (weightToLose <= 0) return new Date(); // Already at goal
  
  const weeksNeeded = weightToLose / weeklyLossRate;
  const daysNeeded = weeksNeeded * 7;
  
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + daysNeeded);
  
  return projectedDate;
}

// Get progress status
export function getProgressStatus(
  currentPace: number,
  requiredPace: number
): {
  status: 'ahead' | 'on-track' | 'behind';
  label: string;
  color: 'success' | 'primary' | 'warning';
} {
  const diff = currentPace - requiredPace;
  
  if (diff > 0.1) {
    return { status: 'ahead', label: 'Ahead of schedule', color: 'success' };
  } else if (diff > -0.1) {
    return { status: 'on-track', label: 'On track', color: 'primary' };
  } else {
    return { status: 'behind', label: 'Behind schedule', color: 'warning' };
  }
}

// Calculate logging streak
export function calculateStreak(entries: DailyEntry[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let checkDate = new Date(today);
  
  // Sort entries by date descending
  const sortedEntries = [...entries]
    .filter(e => e.weight !== undefined || e.steps !== undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    // Check if this entry is for the expected date
    const daysDiff = Math.round((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (daysDiff === 1 && streak === 0) {
      // Allow starting streak from yesterday if no entry today yet
      streak++;
      checkDate = entryDate;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// Format date for display
export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    const now = new Date();
    const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays === -1) return 'yesterday';
    if (diffDays > 0 && diffDays < 7) return `in ${diffDays} days`;
    if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Get today's date as ISO string
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// Generate motivational insight
export function generateInsight(
  currentWeight: number,
  targetWeight: number,
  weeklyRate: number | null,
  requiredRate: number,
  projectedDate: Date | null,
  goalDate: string
): string {
  if (currentWeight <= targetWeight) {
    return "Congratulations! You've reached your goal weight. Time to maintain!";
  }
  
  if (!weeklyRate || weeklyRate <= 0) {
    return "Start logging your weight daily to see your projected progress.";
  }
  
  const goal = new Date(goalDate);
  
  if (projectedDate && projectedDate <= goal) {
    const daysAhead = Math.round((goal.getTime() - projectedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAhead > 7) {
      return `Great momentum! At this pace, you'll reach your goal ${daysAhead} days early.`;
    }
    return `You're on track! Keep up the consistent effort.`;
  }
  
  const rateDiff = requiredRate - weeklyRate;
  if (rateDiff > 0.5) {
    return `You're ${rateDiff.toFixed(1)} kg/week behind target. Consider adding more activity or adjusting your calorie intake.`;
  } else if (rateDiff > 0) {
    const extraSteps = Math.round(rateDiff * 7000); // Rough estimate: 7000 steps ≈ 0.1kg
    return `You're slightly behind — adding ~${extraSteps.toLocaleString()} steps per week could get you back on track.`;
  }
  
  return "Keep logging daily to track your progress accurately.";
}
