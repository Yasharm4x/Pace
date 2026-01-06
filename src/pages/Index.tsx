import { useMemo, useState } from 'react';
import { Settings } from 'lucide-react';

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
  const currentWeight =
    getLatestWeight() || profile?.startingWeight || 0;

  const streak = useMemo(
    () => calculateStreak(entries),
    [entries]
  );

  /* -------------------------------------------------- */
  /*  🔁 RESET PROFILE (KEY FIX)                         */
  /* -------------------------------------------------- */
  const resetProfile = () => {
    clearData();
    setShowSettings(false);
  };

  /* -------------------------------------------------- */
  /*  LOADING                                           */
  /* -------------------------------------------------- */
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* -------------------------------------------------- */
  /*  ONBOARDING                                        */
  /* -------------------------------------------------- */
  if (!profile) {
    return <ProfileSetup onComplete={updateProfile} />;
  }

  /* -------------------------------------------------- */
  /*  MAIN APP                                          */
  /* -------------------------------------------------- */
  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-bold">Fitness</h1>
            <p className="text-xs text-muted-foreground">
              {currentWeight.toFixed(1)} kg →{' '}
              {profile.targetWeight.toFixed(1)} kg
            </p>
          </div>

          <button
            onClick={() => setShowSettings(v => !v)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-accent"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <ActivityRings
          steps={todayEntry?.steps || 0}
          stepsGoal={profile.dailyStepGoal}
          calories={todayEntry?.caloriesBurned || 0}
          caloriesGoal={profile.dailyCalorieGoal}
          streak={streak}
        />

        <ProjectionCard
          entries={entries}
          profile={profile}
          currentWeight={currentWeight}
        />

        <DailyInput
          todayEntry={todayEntry}
          onUpdate={updateTodayEntry}
          lastSaved={lastSaved}
        />

        <BMIIndicator
          weight={currentWeight}
          height={profile.height}
        />

        <StatsOverview
          entries={entries}
          profile={profile}
          currentWeight={currentWeight}
        />

        <WeightChart
          entries={entries}
          startWeight={profile.startingWeight}
          targetWeight={profile.targetWeight}
          startDate={profile.startDate}
          goalDate={profile.goalDate}
        />

        {/* SETTINGS */}
        {showSettings && (
          <DataManagement
            onExportJSON={exportData}
            onExportCSV={exportCSV}
            onImport={importData}
            onResetProfile={resetProfile}
            onClearAll={clearData}
          />
        )}

        <div className="h-8" />
      </main>
    </div>
  );
};

export default Index;
