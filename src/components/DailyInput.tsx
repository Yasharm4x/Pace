import { useState, useEffect, useCallback } from 'react';
import { Scale, Footprints, Flame, Check } from 'lucide-react';
import { DailyEntry, formatDate, getTodayISO } from '@/lib/fitness-utils';
import { cn } from '@/lib/utils';

interface DailyInputProps {
  todayEntry: DailyEntry | undefined;
  onUpdate: (updates: Partial<DailyEntry>) => void;
  lastSaved: number | null;
}

export function DailyInput({ todayEntry, onUpdate, lastSaved }: DailyInputProps) {
  const [weight, setWeight] = useState(todayEntry?.weight?.toString() || '');
  const [steps, setSteps] = useState(todayEntry?.steps?.toString() || '');
  const [calories, setCalories] = useState(todayEntry?.caloriesBurned?.toString() || '');
  const [saveIndicator, setSaveIndicator] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Sync with external data
  useEffect(() => {
    if (todayEntry) {
      if (todayEntry.weight !== undefined) setWeight(todayEntry.weight.toString());
      if (todayEntry.steps !== undefined) setSteps(todayEntry.steps.toString());
      if (todayEntry.caloriesBurned !== undefined) setCalories(todayEntry.caloriesBurned.toString());
    }
  }, [todayEntry]);

  // Auto-save with debounce
  const debouncedSave = useCallback((field: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) && value !== '') return;

    setSaveIndicator('saving');
    
    const updates: Partial<DailyEntry> = {};
    if (field === 'weight' && value !== '') updates.weight = numValue;
    if (field === 'steps' && value !== '') updates.steps = Math.round(numValue);
    if (field === 'calories' && value !== '') updates.caloriesBurned = Math.round(numValue);

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }

    setTimeout(() => setSaveIndicator('saved'), 300);
    setTimeout(() => setSaveIndicator('idle'), 1500);
  }, [onUpdate]);

  const handleWeightChange = (value: string) => {
    setWeight(value);
    const timeoutId = setTimeout(() => debouncedSave('weight', value), 500);
    return () => clearTimeout(timeoutId);
  };

  const handleStepsChange = (value: string) => {
    setSteps(value);
    const timeoutId = setTimeout(() => debouncedSave('steps', value), 500);
    return () => clearTimeout(timeoutId);
  };

  const handleCaloriesChange = (value: string) => {
    setCalories(value);
    const timeoutId = setTimeout(() => debouncedSave('calories', value), 500);
    return () => clearTimeout(timeoutId);
  };

  const today = new Date();

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">{formatDate(today, 'long')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lastSaved ? (
              <span className="flex items-center gap-1">
                <Check size={10} className={cn(
                  'transition-opacity',
                  saveIndicator === 'saved' ? 'text-success opacity-100' : 'opacity-50'
                )} />
                Last saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              'Not saved yet'
            )}
          </p>
        </div>
        <div className={cn(
          'w-2 h-2 rounded-full transition-all duration-300',
          saveIndicator === 'saving' && 'bg-warning animate-pulse',
          saveIndicator === 'saved' && 'bg-success',
          saveIndicator === 'idle' && 'bg-muted-foreground/30'
        )} />
      </div>

      <div className="space-y-3">
        {/* Weight input */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
          <div className="w-10 h-10 rounded-xl bg-ring-steps/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-ring-steps" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">Weight</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              placeholder="0.0"
              className="input-clean w-full text-lg font-semibold bg-transparent"
            />
          </div>
          <span className="text-muted-foreground text-sm">kg</span>
        </div>

        {/* Steps input */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
          <div className="w-10 h-10 rounded-xl bg-ring-steps/10 flex items-center justify-center">
            <Footprints className="w-5 h-5 text-ring-steps" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">Steps</label>
            <input
              type="number"
              inputMode="numeric"
              value={steps}
              onChange={(e) => handleStepsChange(e.target.value)}
              placeholder="0"
              className="input-clean w-full text-lg font-semibold bg-transparent"
            />
          </div>
          <span className="text-muted-foreground text-sm">steps</span>
        </div>

        {/* Calories input */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
          <div className="w-10 h-10 rounded-xl bg-ring-calories/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-ring-calories" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">Calories burned</label>
            <input
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={(e) => handleCaloriesChange(e.target.value)}
              placeholder="0"
              className="input-clean w-full text-lg font-semibold bg-transparent"
            />
          </div>
          <span className="text-muted-foreground text-sm">kcal</span>
        </div>
      </div>
    </div>
  );
}
