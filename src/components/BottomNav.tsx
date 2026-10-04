import { Plus, Syringe, Syringe as SyringeIcon, Camera, Loader2, Home, Pill, Sparkles, ImageIcon } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeDatePicker } from '@/components/ui/NativeDatePicker';
import { DosagePicker } from '@/components/ui/DosagePicker';
import { useEffect, useState } from 'react';
import { useDoses } from '@/hooks/useDoses';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import InjectionSitePicker, { InjectionSite } from '@/components/InjectionSitePicker';
import { getInjectionSiteLabel } from '@/utils/injectionSites';
import { AnalysisEntry } from '@/types/analysis';

// Reduz a foto para caber no limite de 4,5 MB do corpo das Vercel Functions.
const resizeImage = (file: File, maxSize = 1280): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas indisponível'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Imagem inválida'));
    };
    img.src = url;
  });

export const BottomNav = () => {
  const { toast } = useToast();
  const { addDose } = useDoses();
  const { data } = useOnboarding();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'menu' | 'dose' | 'analysis'>('menu');
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number }>(() => {
    const today = new Date();
    return { day: today.getDate(), month: today.getMonth(), year: today.getFullYear() };
  });
  const [dosage, setDosage] = useState<number>(() => {
    const parsed = parseFloat(String(data.currentDose || '').replace(',', '.'));
    return isNaN(parsed) ? 0.25 : parsed;
  });
  const [site, setSite] = useState<InjectionSite | undefined>(undefined);

  // --- Análise por foto (OpenAI, via /api/analyze-meal) ---
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    name?: string;
    healthScore?: number;
    processingLevel?: string;
    nutrients?: { kcal: number; protein: number; carbs: number; fat: number; fiber?: number };
  } | null>(null);

  const handleImageChange = async (file?: File | null) => {
    if (!file) {
      setImageDataUrl(null);
      return;
    }
    try {
      setImageDataUrl(await resizeImage(file));
    } catch {
      setAnalysisError('Não foi possível ler a imagem.');
    }
  };

  const analyzeWithOpenAI = async () => {
    if (!imageDataUrl) {
      setAnalysisError('Selecione ou tire uma foto do prato.');
      return;
    }
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    try {
      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      const parsed = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(parsed?.error || 'Falha na análise com OpenAI');
      }
      setAnalysisResult(parsed);

      // Persistir análise no localStorage (histórico na página Lifestyle)
      const entry: AnalysisEntry = {
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : String(Date.now()),
        createdAt: Date.now(),
        imageDataUrl,
        name: parsed?.name,
        healthScore: parsed?.healthScore,
        processingLevel: parsed?.processingLevel,
        nutrients: parsed?.nutrients,
      };
      try {
        const raw = localStorage.getItem('moujapp-lifestyle');
        const payload = raw ? JSON.parse(raw) : {};
        const history: AnalysisEntry[] = Array.isArray(payload?.analysisHistory) ? payload.analysisHistory : [];
        payload.analysisHistory = [entry, ...history].slice(0, 20);
        localStorage.setItem('moujapp-lifestyle', JSON.stringify(payload));
        toast({ title: 'Análise salva', description: 'Histórico atualizado em Estilo de Vida.' });
      } catch {}
    } catch (err: any) {
      setAnalysisError(String(err?.message || err));
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Permite abrir o modal de adicionar dose a partir de qualquer página
  useEffect(() => {
    const openQuickAddDose = () => {
      setStep('dose');
      setOpen(true);
    };
    window.addEventListener('openQuickAddDose' as any, openQuickAddDose as any);
    return () => window.removeEventListener('openQuickAddDose' as any, openQuickAddDose as any);
  }, []);

  const getDefaultDoseOptions = (med?: string): number[] => {
    const m = (med || '').toLowerCase();
    if (m.includes('mounjaro') || m.includes('tirzepat')) {
      return [2.5, 5, 7.5, 10, 12.5, 15];
    }
    if (m.includes('ozempic') || m.includes('semaglut')) {
      return [0.25, 0.5, 0.75, 1, 2];
    }
    return [0.25, 0.5, 0.75, 1];
  };
  const presetOptions = getDefaultDoseOptions(data.medication);

  const handlePlus = () => {
    setStep('menu');
    setOpen(true);
  };

  const handleAddDose = () => {
    if (!selectedDate) {
      toast({ title: 'Selecione uma data', description: 'Escolha a data da aplicação.' });
      return;
    }
    const dateObj = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
    addDose(dateObj, dosage, site);
    setOpen(false);
    setStep('menu');
    toast({
      title: 'Dose registrada',
      description: `Adicionada ${dosage}mg${site ? ` no ${getInjectionSiteLabel(site)}` : ''} em ${dateObj.toLocaleDateString('pt-BR')}`,
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="relative mx-auto max-w-md h-16 px-4 flex items-center justify-between">
        {/* Home */}
        <NavLink
          to="/dashboard"
          className="flex flex-col items-center gap-1 text-xs text-muted-foreground min-w-[48px]"
          activeClassName="text-primary"
        >
          <Home className="w-5 h-5" />
          <span>Início</span>
        </NavLink>

        {/* Tratamento */}
        <NavLink
          to="/treatment"
          className="flex flex-col items-center gap-1 text-xs text-muted-foreground min-w-[48px]"
          activeClassName="text-primary"
        >
          <Syringe className="w-5 h-5" />
          <span>Doses</span>
        </NavLink>

        {/* Botão central + */}
        <button
          onClick={handlePlus}
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center"
          aria-label="Ações rápidas"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Suplementos */}
        <NavLink
          to="/supplements"
          className="flex flex-col items-center gap-1 text-xs text-muted-foreground min-w-[48px]"
          activeClassName="text-primary"
        >
          <Pill className="w-5 h-5" />
          <span>Suplementos</span>
        </NavLink>

        {/* IA */}
        <NavLink
          to="/ai-chat"
          className="flex flex-col items-center gap-1 text-xs text-muted-foreground min-w-[48px]"
          activeClassName="text-primary"
        >
          <Sparkles className="w-5 h-5" />
          <span>IA</span>
        </NavLink>
      </div>

      {/* Modal de ações rápidas */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setStep('menu'); }}>
        <DialogContent className="w-[92vw] max-w-sm max-h-[85vh] overflow-hidden rounded-2xl p-0">
          <div className="overflow-y-auto max-h-[85vh] p-5 rounded-2xl">
          {step === 'menu' ? (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Adicionar Registro</DialogTitle>
              </DialogHeader>
              <button
                className="w-full rounded-xl border p-4 flex items-center gap-3 hover:bg-accent hover:text-accent-foreground"
                onClick={() => setStep('dose')}
              >
                <SyringeIcon className="w-5 h-5" />
                <span>Registrar Dose</span>
              </button>
              <button
                className="w-full rounded-xl border p-4 flex items-center gap-3 hover:bg-accent hover:text-accent-foreground"
                onClick={() => setStep('analysis')}
              >
                <Camera className="w-5 h-5" />
                <span>Analisar prato por foto</span>
              </button>
              <button
                className="w-full rounded-xl border p-4 flex items-center gap-3 hover:bg-accent hover:text-accent-foreground"
                onClick={() => { setOpen(false); navigate('/progress-photos'); }}
              >
                <ImageIcon className="w-5 h-5" />
                <span>Foto de progresso</span>
              </button>
            </div>
          ) : (
            step === 'dose' ? (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Dose</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Label>Selecione a data da aplicação:</Label>
                  <NativeDatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Local da aplicação (opcional):</Label>
                  <InjectionSitePicker value={site} onChange={setSite} />
                </div>
                <div className="space-y-2">
                  <Label>Dosagem (mg):</Label>
                  <ToggleGroup className="flex-wrap" type="single" value={String(dosage)} onValueChange={(v) => v && setDosage(parseFloat(v))}>
                    {presetOptions.map((opt) => (
                      <ToggleGroupItem key={opt} value={String(opt)} variant="outline" size="sm">
                        {opt}mg
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Ajuste fino da dosagem:</Label>
                    <div className="mt-2">
                      <DosagePicker
                        value={dosage}
                        onChange={setDosage}
                        min={0.01}
                        max={50}
                        step={0.25}
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Button className="w-full" onClick={handleAddDose}>Adicionar Dose</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Analisar Prato por Foto</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Label className="text-base font-medium">Foto do prato:</Label>
                  
                  {/* Área de upload melhorada */}
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageChange(e.target.files?.[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                      <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <div className="text-base font-medium mb-1">
                        {imageDataUrl ? 'Trocar foto' : 'Escolher arquivo'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {imageDataUrl ? 'Toque para selecionar outra foto' : 'Nenhum arquivo escolhido'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview da imagem */}
                  {imageDataUrl && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Preview:</Label>
                      <img 
                        src={imageDataUrl} 
                        alt="Prévia do prato" 
                        className="w-full max-h-48 object-cover rounded-2xl border shadow-sm" 
                      />
                    </div>
                  )}
                </div>
                
                {/* Botões melhorados */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('menu')}
                    className="h-12 text-base rounded-xl"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={analyzeWithOpenAI} 
                    disabled={analysisLoading || !imageDataUrl}
                    className="h-12 text-base rounded-xl"
                  >
                    {analysisLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" /> 
                        Analisando...
                      </span>
                    ) : (
                      'Analisar'
                    )}
                  </Button>
                </div>
                {analysisError && (
                  <div className="text-sm text-red-600">{analysisError}</div>
                )}
                {analysisResult && (
                  <div className="bg-muted/30 rounded-2xl p-5 space-y-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-2">
                        Resultado estimado pela IA (não substitui aconselhamento profissional)
                      </div>
                      {analysisResult.name && (
                        <div className="text-xl font-bold text-primary">{analysisResult.name}</div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {analysisResult.nutrients?.kcal ?? '--'}
                        </div>
                        <div className="text-xs text-muted-foreground">kcal</div>
                      </div>
                      <div className="bg-background rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {analysisResult.nutrients?.protein ?? '--'}
                        </div>
                        <div className="text-xs text-muted-foreground">g proteína</div>
                      </div>
                      <div className="bg-background rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisResult.nutrients?.carbs ?? '--'}
                        </div>
                        <div className="text-xs text-muted-foreground">g carboidratos</div>
                      </div>
                      <div className="bg-background rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {analysisResult.nutrients?.fat ?? '--'}
                        </div>
                        <div className="text-xs text-muted-foreground">g gordura</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-green-600">
                          {analysisResult.nutrients?.fiber ?? '--'}
                        </div>
                        <div className="text-xs text-muted-foreground">g fibra</div>
                      </div>
                      {typeof analysisResult.healthScore === 'number' && (
                        <div className="bg-background rounded-xl p-3 text-center">
                          <div className="text-lg font-bold text-primary">
                            {analysisResult.healthScore}/100
                          </div>
                          <div className="text-xs text-muted-foreground">health score</div>
                        </div>
                      )}
                    </div>
                    {analysisResult.processingLevel && (
                      <div className="flex justify-between text-sm"><span>Nível de processamento</span><span className="font-medium">{analysisResult.processingLevel}</span></div>
                    )}
                  </div>
                )}
              </div>
            )
          )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BottomNav;