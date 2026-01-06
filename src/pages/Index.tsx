import { useMemo } from 'react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { ProfileSetup } from '@/components/ProfileSetup';
import { DailyInput } from '@/components/DailyInput';
import { ActivityRings } from '@/components/ActivityRings';
import { BMIIndicator } from '@/components/BMIIndicator';
import { WeightChart } from '@/components/WeightChart';
import { ProjectionCard } from '@/components/ProjectionCard';
import { StatsOverview } from '@/components/StatsOverview';
import { DataManagement } from '@/components/DataManagement';
import { calculateStreak } from '@/lib/fitness-utils';
import { Settings } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const {
    isLoaded,
    profile,
    entries,
    lastSaved,
    updateProfile,
    getTodayEntry,
    updateTodayEntry,
    getLatestWeight,
    exportData,
    exportCSV,
    importData,
    clearData,
  } = useFitnessData();

  const [showSettings, setShowSettings] = useState(false);

  const todayEntry = getTodayEntry();
  const currentWeight = getLatestWeight() || profile?.startingWeight || 0;
  const streak = useMemo(() => calculateStreak(entries), [entries]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Onboarding state
  if (!profile) {
    return <ProfileSetup onComplete={updateProfile} />;
  }

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-bold">Fitness</h1>
            <p className="text-xs text-muted-foreground">
              {currentWeight.toFixed(1)} kg → {profile.targetWeight.toFixed(1)} kg
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-accent"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Activity Rings */}
        <section className="animate-fade-in" style={{ animationDelay: '0ms' }}>
          <ActivityRings
            steps={todayEntry?.steps || 0}
            stepsGoal={profile.dailyStepGoal}
            calories={todayEntry?.caloriesBurned || 0}
            caloriesGoal={profile.dailyCalorieGoal}
            streak={streak}
          />
        </section>

        {/* Projection Card */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <ProjectionCard
            entries={entries}
            profile={profile}
            currentWeight={currentWeight}
          />
        </section>

        {/* Daily Input */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <DailyInput
            todayEntry={todayEntry}
            onUpdate={updateTodayEntry}
            lastSaved={lastSaved}
          />
        </section>

        {/* BMI Indicator */}
        <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <BMIIndicator weight={currentWeight} height={profile.height} />
        </section>

        {/* Stats Overview */}
        <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <StatsOverview
            entries={entries}
            profile={profile}
            currentWeight={currentWeight}
          />
        </section>

        {/* Weight Chart */}
        <section className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <WeightChart
            entries={entries}
            startWeight={profile.startingWeight}
            targetWeight={profile.targetWeight}
            startDate={profile.startDate}
            goalDate={profile.goalDate}
          />
        </section>

        {/* Settings Panel */}
        {showSettings && (
          <section className="animate-fade-in">
            <DataManagement
              onExportJSON={exportData}
              onExportCSV={exportCSV}
              onImport={importData}
              onClear={clearData}
            />
          </section>
        )}

        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </main>
    </div>
  );
};

export default Index;
