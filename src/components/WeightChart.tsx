import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  Area,
  ComposedChart,
} from 'recharts';
import { DailyEntry, formatDate } from '@/lib/fitness-utils';

interface WeightChartProps {
  entries: DailyEntry[];
  startWeight: number;
  targetWeight: number;
  startDate: string;
  goalDate: string;
}

export function WeightChart({
  entries,
  startWeight,
  targetWeight,
  startDate,
  goalDate,
}: WeightChartProps) {
  const chartData = useMemo(() => {
    // Sort entries by date
    const sorted = [...entries]
      .filter(e => e.weight !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sorted.length === 0) return [];

    // Calculate 7-day moving average
    return sorted.map((entry, index) => {
      const windowStart = Math.max(0, index - 6);
      const window = sorted.slice(windowStart, index + 1);
      const avg = window.reduce((sum, e) => sum + (e.weight || 0), 0) / window.length;

      return {
        date: entry.date,
        weight: entry.weight,
        average: parseFloat(avg.toFixed(2)),
        displayDate: formatDate(entry.date, 'short'),
      };
    });
  }, [entries]);

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-4">
        <h3 className="stat-label mb-4">Weight Trend</h3>
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Log your first weight entry to see the trend
        </div>
      </div>
    );
  }

  const allWeights = chartData.map(d => d.weight).filter(Boolean) as number[];
  const minWeight = Math.min(...allWeights, targetWeight) - 1;
  const maxWeight = Math.max(...allWeights, startWeight) + 1;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="stat-label">Weight Trend</h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-muted-foreground/50 rounded" />
            <span className="text-muted-foreground">Daily</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-primary rounded" />
            <span className="text-muted-foreground">7-day avg</span>
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minWeight, maxWeight]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickFormatter={(value) => `${value}`}
            />

            {/* Target weight reference line */}
            <ReferenceLine
              y={targetWeight}
              stroke="hsl(var(--success))"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />

            {/* Area under average line */}
            <Area
              type="monotone"
              dataKey="average"
              fill="url(#weightGradient)"
              stroke="none"
            />

            {/* Daily weight (faded) */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              strokeOpacity={0.4}
              dot={{
                r: 3,
                fill: 'hsl(var(--muted-foreground))',
                fillOpacity: 0.4,
              }}
              activeDot={{
                r: 5,
                fill: 'hsl(var(--foreground))',
              }}
            />

            {/* 7-day average (prominent) */}
            <Line
              type="monotone"
              dataKey="average"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 6,
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                boxShadow: 'var(--shadow-card)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)} kg`,
                name === 'average' ? '7-day avg' : 'Weight',
              ]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
