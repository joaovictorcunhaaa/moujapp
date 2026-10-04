import { useMemo, useState } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Syringe } from 'lucide-react';
import type { DoseRecord } from '@/hooks/useDoses';

type RangeKey = '7d' | '30d' | '90d' | '1a';

const RANGE_DAYS: Record<RangeKey, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1a': 365,
};

function formatDayShort(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export interface MedicationChartProps {
  doses: DoseRecord[];
}

export const MedicationChart = ({ doses }: MedicationChartProps) => {
  const [range, setRange] = useState<RangeKey>('7d');

  const data = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getTime() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000);

    const filtered = doses
      .filter(d => new Date(d.dateISO) >= start)
      .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
      .map(d => ({
        date: new Date(d.dateISO),
        dateLabel: formatDayShort(new Date(d.dateISO)),
        dosageMg: d.dosageMg,
      }));

    return filtered;
  }, [doses, range]);

  const hasData = data.length > 0;

  return (
    <div className="bg-muted rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Syringe className="w-4 h-4" />
          <span>Medicação</span>
        </div>
        <div className="flex items-center gap-1">
          {(['7d','30d','90d','1a'] as RangeKey[]).map(key => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                range === key ? 'bg-foreground text-background border-foreground' : 'bg-background hover:bg-accent border-border'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Wrapper do gráfico com bordas e clipping para evitar overflow */}
      <div className="w-full h-56 overflow-hidden rounded-xl">
        {hasData ? (
          <ChartContainer
            config={{ dosage: { label: 'Dosagem (mg)', color: 'rgb(99, 102, 241)' } }}
            className="h-full w-full"
          >
            <AreaChart data={data} margin={{ left: 25, right: 8, top: 10, bottom: 8 }}>
              <defs>
                <linearGradient id="medicationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}mg`}
                width={25}
                tickMargin={6}
              />
              <ChartTooltip content={<ChartTooltipContent nameKey="dosage" />} />
              <Area
                type="monotone"
                dataKey="dosageMg"
                stroke="rgb(99, 102, 241)"
                strokeWidth={2}
                fill="url(#medicationGradient)"
                name="dosage"
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <div>Nenhum registro no período selecionado.</div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openQuickAddDose'))}
              className="px-3 py-1.5 rounded-full border bg-primary/10 text-primary hover:bg-primary/20"
            >
              Adicionar dose
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationChart;