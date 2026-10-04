import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Progress } from '@/components/ui/progress';
import { Calendar, ArrowLeft, Trash, CheckCircle, Syringe, AlertTriangle, FileText, Printer } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useDoses } from '@/hooks/useDoses';
import MedicationChart from '@/components/MedicationChart';
import { calculateNextDoseDate, getTimeDifference, calculateBMI } from '@/utils/calculations';
import { getInjectionSiteLabel } from '@/utils/injectionSites';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Treatment = () => {
  const { data, resetOnboarding } = useOnboarding();
  const { doses, lastDose, removeDose, clearDoses } = useDoses();
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);

  const weightProgressRaw = data.startWeight && data.targetWeight && data.weight && data.startWeight !== data.targetWeight
    ? ((data.startWeight - data.weight) / (data.startWeight - data.targetWeight)) * 100
    : 0;
  const weightProgress = Math.max(0, Math.min(weightProgressRaw, 100));
  const goalReached = typeof data.targetWeight === 'number' && typeof data.weight === 'number'
    ? data.weight <= data.targetWeight
    : false;

  const weightIncreased = typeof data.startWeight === 'number' && typeof data.weight === 'number'
    ? data.weight > data.startWeight
    : false;

  const handleReset = () => {
    // Limpar caches e histórico
    try {
      clearDoses();
      localStorage.removeItem('moujapp-doses');
      localStorage.removeItem('moujapp-lifestyle');
    } catch {}
    resetOnboarding();
    navigate('/onboarding');
  };

  // Exibir apenas a data (sem hora)
  const formatDateOnly = (date: Date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  const lastDoseDate = lastDose ? new Date(lastDose.dateISO) : null;
  const nextDoseDate = lastDoseDate ? calculateNextDoseDate(lastDoseDate, data.frequency || 'Semanalmente') : null;
  const nextDoseCountdown = nextDoseDate ? getTimeDifference(nextDoseDate) : '--';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full border hover:bg-accent hover:text-accent-foreground"
            aria-label="Voltar para o dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Tratamento</h1>
            <p className="text-muted-foreground">Acompanhe seu progresso e medicação.</p>
          </div>
        </div>

        {/* Medication Chart */}
        <MedicationChart doses={doses} />

        {/* Weight Progress */}
        <div className="bg-muted rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Progresso de Peso</h3>
            <span className="text-sm text-primary font-medium">
              {Math.round(weightProgress)}% da meta
            </span>
          </div>
          <Progress value={weightProgress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{data.startWeight || '--'}kg (inicial)</span>
            <span>{data.targetWeight || '--'}kg (meta)</span>
          </div>
        </div>

        {/* Weight Increased Alert */}
        {weightIncreased && !goalReached && (
          <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold">Cuidado</h3>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              O peso aumentou em relação ao início do tratamento.
            </p>
            <div className="flex justify-between text-sm text-red-700 dark:text-red-300">
              <span>Atual: {data.weight || '--'}kg</span>
              <span>Inicial: {data.startWeight || '--'}kg</span>
            </div>
          </div>
        )}

        {/* Goal Reached Card */}
        {goalReached && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="w-5 h-5" />
              <h3 className="font-semibold">Meta atingida!</h3>
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Parabéns! Você atingiu sua meta de peso.
            </p>
            <div className="flex justify-between text-sm text-emerald-700 dark:text-emerald-300">
              <span>Atual: {data.weight || '--'}kg</span>
              <span>Meta: {data.targetWeight || '--'}kg</span>
            </div>
          </div>
        )}

        {/* Medication */}
        <div className="bg-muted rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span>Seu Medicamento</span>
          </div>
          <div className="text-lg font-bold">{data.medication || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">Dose: {data.currentDose || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">Frequência: {data.frequency || 'N/A'}</div>
        </div>

        {/* Doses */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="w-4 h-4" />
              <span>Última dose</span>
            </div>
            {lastDoseDate ? (
              <div className="text-lg font-bold">{formatDateOnly(lastDoseDate)}</div>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openQuickAddDose'))}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full border bg-primary/10 text-primary hover:bg-primary/20"
                  aria-label="Adicionar primeira dose"
                >
                  <Syringe className="w-7 h-7" />
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openQuickAddDose'))}
                  className="text-sm text-primary"
                >
                  Adicionar dose
                </button>
              </div>
            )}
          </div>

          <div className="bg-muted rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="w-4 h-4" />
              <span>Próxima dose</span>
            </div>
            {nextDoseDate ? (
              <>
                <div className="text-lg font-bold">{formatDateOnly(nextDoseDate)}</div>
                <div className="text-sm text-muted-foreground">{nextDoseCountdown}</div>
              </>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openQuickAddDose'))}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full border bg-primary/10 text-primary hover:bg-primary/20"
                  aria-label="Adicionar primeira dose"
                >
                  <Syringe className="w-7 h-7" />
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openQuickAddDose'))}
                  className="text-sm text-primary"
                >
                  Adicionar dose
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Registros de doses */}
        <div className="bg-muted rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Registros Aplicações</h3>
            <span className="text-sm text-muted-foreground">{doses.length} registro(s)</span>
          </div>
          <div className="space-y-3">
            {doses.slice(0, 5).map((d) => {
              const dt = new Date(d.dateISO);
              return (
                <div key={d.id} className="flex items-center justify-between rounded-xl border px-3 py-2">
                  <div className="text-sm">{formatDateOnly(dt)}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {d.dosageMg}mg
                      {d.site ? (
                        <span className="text-muted-foreground"> — {getInjectionSiteLabel(d.site)}</span>
                      ) : null}
                    </div>
                    <button
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      aria-label="Remover registro"
                      onClick={() => removeDose(d.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {doses.length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhuma dose registrada ainda.</div>
            )}
          </div>
        </div>

        {/* Relatório médico */}
        <button
          onClick={() => setReportOpen(true)}
          className="w-full rounded-2xl border p-4 flex items-center gap-3 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">Relatório para o Médico</p>
            <p className="text-xs text-muted-foreground">Resumo do tratamento pronto para imprimir</p>
          </div>
        </button>
      </div>

      <BottomNav />

      {/* Report modal */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatório do Tratamento
            </DialogTitle>
          </DialogHeader>

          <div id="medical-report" className="space-y-4 text-sm">
            <div className="border rounded-xl p-4 space-y-1">
              <p className="font-bold text-base">{data.name || 'Paciente'}</p>
              <p className="text-muted-foreground">Medicamento: <strong>{data.medication || 'N/I'}</strong></p>
              <p className="text-muted-foreground">Dose: <strong>{data.currentDose || 'N/I'}</strong> · Frequência: <strong>{data.frequency || 'N/I'}</strong></p>
              <p className="text-muted-foreground">Gerado em: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="border rounded-xl p-4 space-y-2">
              <p className="font-semibold">Dados Físicos</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">{data.weight || '--'} kg</p>
                  <p className="text-xs text-muted-foreground">Peso atual</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">{data.weight && data.height ? calculateBMI(data.weight, data.height) : '--'}</p>
                  <p className="text-xs text-muted-foreground">IMC</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">{data.startWeight || '--'} kg</p>
                  <p className="text-xs text-muted-foreground">Peso inicial</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">{data.targetWeight || '--'} kg</p>
                  <p className="text-xs text-muted-foreground">Meta</p>
                </div>
              </div>
              {data.startWeight && data.weight && (
                <p className="text-center text-muted-foreground">
                  Variação total: <strong>{(data.startWeight - data.weight).toFixed(1) > '0' ? '-' : '+'}{Math.abs(data.startWeight - data.weight).toFixed(1)} kg</strong>
                </p>
              )}
            </div>

            <div className="border rounded-xl p-4 space-y-2">
              <p className="font-semibold">Histórico de Aplicações ({doses.length} dose{doses.length !== 1 ? 's' : ''})</p>
              {doses.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma dose registrada.</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {doses.map((d) => (
                    <div key={d.id} className="flex justify-between text-xs border-b pb-1">
                      <span>{new Date(d.dateISO).toLocaleDateString('pt-BR')}</span>
                      <span>{d.dosageMg}mg{d.site ? ` · ${getInjectionSiteLabel(d.site)}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Gerado pelo MoujApp · Dados armazenados localmente no dispositivo
            </p>
          </div>

          <Button
            onClick={() => window.print()}
            className="w-full gap-2 mt-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Treatment;