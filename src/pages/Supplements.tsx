import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check, Pill, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

interface Supplement {
  id: string;
  name: string;
  dose: string;
  time: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface DailyCheck {
  date: string; // YYYY-MM-DD
  checked: Record<string, boolean>; // suppId -> checked
}

const TIME_LABELS: Record<Supplement['time'], string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
  night: 'Antes de dormir',
};

const TIME_COLORS: Record<Supplement['time'], string> = {
  morning: 'bg-amber-100 text-amber-700 border-amber-200',
  afternoon: 'bg-sky-100 text-sky-700 border-sky-200',
  evening: 'bg-violet-100 text-violet-700 border-violet-200',
  night: 'bg-slate-100 text-slate-700 border-slate-200',
};

const DEFAULT_SUPPLEMENTS: Supplement[] = [
  { id: 'vit-d', name: 'Vitamina D3', dose: '2000 UI', time: 'morning' },
  { id: 'omega3', name: 'Ômega-3', dose: '1g', time: 'morning' },
  { id: 'magnesium', name: 'Magnésio', dose: '300mg', time: 'night' },
  { id: 'b12', name: 'Vitamina B12', dose: '500mcg', time: 'morning' },
];

const getTodayKey = () => new Date().toISOString().split('T')[0];

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const Supplements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [supplements, setSupplements] = useState<Supplement[]>(() =>
    loadFromStorage('moujapp-supplements-list', DEFAULT_SUPPLEMENTS)
  );
  const [dailyCheck, setDailyCheck] = useState<DailyCheck>(() => {
    const saved = loadFromStorage<DailyCheck>('moujapp-supplements-check', { date: '', checked: {} });
    if (saved.date !== getTodayKey()) return { date: getTodayKey(), checked: {} };
    return saved;
  });

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newTime, setNewTime] = useState<Supplement['time']>('morning');

  useEffect(() => {
    saveToStorage('moujapp-supplements-list', supplements);
  }, [supplements]);

  useEffect(() => {
    saveToStorage('moujapp-supplements-check', dailyCheck);
  }, [dailyCheck]);

  const toggleCheck = (id: string) => {
    setDailyCheck((prev) => ({
      ...prev,
      checked: { ...prev.checked, [id]: !prev.checked[id] },
    }));
  };

  const addSupplement = () => {
    if (!newName.trim()) return;
    const newSupp: Supplement = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      dose: newDose.trim(),
      time: newTime,
    };
    setSupplements((prev) => [...prev, newSupp]);
    setNewName('');
    setNewDose('');
    setNewTime('morning');
    setAddOpen(false);
    toast({ title: 'Suplemento adicionado' });
  };

  const removeSupplement = (id: string) => {
    setSupplements((prev) => prev.filter((s) => s.id !== id));
    setDailyCheck((prev) => {
      const updated = { ...prev.checked };
      delete updated[id];
      return { ...prev, checked: updated };
    });
  };

  const checkedCount = supplements.filter((s) => dailyCheck.checked[s.id]).length;
  const progress = supplements.length > 0 ? Math.round((checkedCount / supplements.length) * 100) : 0;

  const grouped = (['morning', 'afternoon', 'evening', 'night'] as const).reduce<
    Record<Supplement['time'], Supplement[]>
  >(
    (acc, time) => {
      acc[time] = supplements.filter((s) => s.time === time);
      return acc;
    },
    { morning: [], afternoon: [], evening: [], night: [] }
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full border hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Suplementos</h1>
            <p className="text-sm text-muted-foreground">Checklist diário</p>
          </div>
        </div>

        {/* Progress card */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              <span className="font-semibold">Progresso de hoje</span>
            </div>
            <span className="text-sm font-medium text-primary">
              {checkedCount}/{supplements.length}
            </span>
          </div>
          <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && supplements.length > 0 && (
            <p className="text-sm text-primary font-medium">🎉 Todos os suplementos tomados!</p>
          )}
        </div>

        {/* Groups */}
        {(['morning', 'afternoon', 'evening', 'night'] as const).map((time) => {
          const items = grouped[time];
          if (items.length === 0) return null;
          return (
            <div key={time} className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {TIME_LABELS[time]}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((supp) => {
                  const done = !!dailyCheck.checked[supp.id];
                  return (
                    <div
                      key={supp.id}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border p-4 transition-all',
                        done ? 'bg-primary/5 border-primary/30' : 'bg-muted'
                      )}
                    >
                      <button
                        onClick={() => toggleCheck(supp.id)}
                        className={cn(
                          'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                          done
                            ? 'bg-primary border-primary text-white'
                            : 'border-muted-foreground/40 hover:border-primary'
                        )}
                      >
                        {done && <Check className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium text-sm', done && 'line-through text-muted-foreground')}>
                          {supp.name}
                        </p>
                        {supp.dose && (
                          <p className="text-xs text-muted-foreground">{supp.dose}</p>
                        )}
                      </div>
                      <span className={cn('text-xs px-2 py-1 rounded-full border', TIME_COLORS[time])}>
                        {TIME_LABELS[time]}
                      </span>
                      <button
                        onClick={() => removeSupplement(supp.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {supplements.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <Pill className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">Nenhum suplemento cadastrado.</p>
          </div>
        )}

        <Button onClick={() => setAddOpen(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Suplemento
        </Button>
      </div>

      <BottomNav />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="w-[92vw] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Novo Suplemento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nome *</label>
              <Input
                placeholder="Ex: Vitamina D3"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Dose (opcional)</label>
              <Input
                placeholder="Ex: 2000 UI"
                value={newDose}
                onChange={(e) => setNewDose(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Horário</label>
              <div className="grid grid-cols-2 gap-2">
                {(['morning', 'afternoon', 'evening', 'night'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewTime(t)}
                    className={cn(
                      'px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                      newTime === t
                        ? 'bg-primary text-white border-primary'
                        : 'border-border hover:bg-accent'
                    )}
                  >
                    {TIME_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={addSupplement} className="flex-1" disabled={!newName.trim()}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Supplements;
