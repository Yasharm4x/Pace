import { useState } from 'react';
import { UserProfile } from '@/lib/fitness-utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Sparkles } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [startingWeight, setStartingWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [dailyStepGoal, setDailyStepGoal] = useState('10000');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState('500');

  const handleSubmit = () => {
    const profile: UserProfile = {
      age: parseInt(age),
      height: parseFloat(height),
      startingWeight: parseFloat(startingWeight),
      targetWeight: parseFloat(targetWeight),
      startDate: '2025-01-06', // Fixed start date as per requirements
      goalDate: '2025-04-01', // Fixed goal date as per requirements
      dailyStepGoal: parseInt(dailyStepGoal),
      dailyCalorieGoal: parseInt(dailyCalorieGoal),
    };
    onComplete(profile);
  };

  const steps = [
    {
      title: 'About you',
      subtitle: 'Let\'s personalize your journey',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Age</label>
            <input
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Years"
              className="w-full p-4 rounded-xl bg-secondary text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Height</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                className="w-full p-4 rounded-xl bg-secondary text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">cm</span>
            </div>
          </div>
        </div>
      ),
      isValid: age !== '' && height !== '',
    },
    {
      title: 'Your goal',
      subtitle: 'January 6 → April 1',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Starting weight (Jan 6)</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={startingWeight}
                onChange={(e) => setStartingWeight(e.target.value)}
                placeholder="85.0"
                className="w-full p-4 rounded-xl bg-secondary text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">kg</span>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Target weight</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="73.0"
                className="w-full p-4 rounded-xl bg-secondary text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">kg</span>
            </div>
          </div>
          {startingWeight && targetWeight && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 text-success text-sm">
                <Target size={16} />
                <span>
                  Lose {(parseFloat(startingWeight) - parseFloat(targetWeight)).toFixed(1)} kg in ~12 weeks
                </span>
              </div>
            </div>
          )}
        </div>
      ),
      isValid: startingWeight !== '' && targetWeight !== '',
    },
    {
      title: 'Daily goals',
      subtitle: 'Set realistic targets',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Daily step goal</label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={dailyStepGoal}
                onChange={(e) => setDailyStepGoal(e.target.value)}
                placeholder="10000"
                className="w-full p-4 rounded-xl bg-secondary text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">steps</span>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Daily active calorie goal</label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={dailyCalorieGoal}
                onChange={(e) => setDailyCalorieGoal(e.target.value)}
                placeholder="500"
                className="w-full p-4 rounded-xl bg-secondary text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">kcal</span>
            </div>
          </div>
        </div>
      ),
      isValid: dailyStepGoal !== '' && dailyCalorieGoal !== '',
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-inset">
      {/* Header */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-primary' : i < step ? 'w-4 bg-primary/50' : 'w-4 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in" key={step}>
          <div className="flex items-center gap-2 justify-center mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm text-primary font-medium">Step {step + 1} of {steps.length}</span>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">{currentStep.title}</h1>
          <p className="text-muted-foreground text-center mb-8">{currentStep.subtitle}</p>
          
          {currentStep.content}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pb-8">
        <Button
          onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleSubmit()}
          disabled={!currentStep.isValid}
          className="w-full h-14 text-lg font-semibold rounded-2xl"
          size="lg"
        >
          {step < steps.length - 1 ? (
            <>
              Continue
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          ) : (
            'Start tracking'
          )}
        </Button>
      </div>
    </div>
  );
}
