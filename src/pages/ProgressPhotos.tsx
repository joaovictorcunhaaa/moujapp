import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Trash2, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

interface ProgressPhoto {
  id: string;
  dataUrl: string;
  date: string; // ISO string
  weight?: number;
  note?: string;
}

const loadPhotos = (): ProgressPhoto[] => {
  try {
    const raw = localStorage.getItem('moujapp-photos');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const savePhotos = (photos: ProgressPhoto[]) => {
  try {
    localStorage.setItem('moujapp-photos', JSON.stringify(photos));
  } catch {}
};

const ProgressPhotos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<ProgressPhoto[]>(loadPhotos);
  const [addOpen, setAddOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<number>(0);
  const [compareB, setCompareB] = useState<number>(1);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [newPhotoData, setNewPhotoData] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    savePhotos(photos);
  }, [photos]);

  const handleFileChange = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewPhotoData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addPhoto = () => {
    if (!newPhotoData) return;
    const photo: ProgressPhoto = {
      id: crypto.randomUUID(),
      dataUrl: newPhotoData,
      date: new Date().toISOString(),
      note: newNote.trim() || undefined,
      weight: newWeight ? parseFloat(newWeight) : undefined,
    };
    const updated = [photo, ...photos];
    setPhotos(updated);
    setNewPhotoData(null);
    setNewNote('');
    setNewWeight('');
    setAddOpen(false);
    toast({ title: 'Foto salva!' });
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setPreviewIndex(null);
    toast({ title: 'Foto removida' });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full border hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Fotos de Progresso</h1>
              <p className="text-sm text-muted-foreground">{photos.length} foto(s) registrada(s)</p>
            </div>
          </div>
          {photos.length >= 2 && (
            <button
              onClick={() => setCompareMode((v) => !v)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                compareMode ? 'bg-primary text-white border-primary' : 'hover:bg-accent'
              )}
            >
              {compareMode ? 'Ver galeria' : 'Comparar'}
            </button>
          )}
        </div>

        {/* Compare mode */}
        {compareMode && photos.length >= 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Antes', idx: compareA, setIdx: setCompareA },
                { label: 'Depois', idx: compareB, setIdx: setCompareB },
              ].map(({ label, idx, setIdx }) => (
                <div key={label} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">
                    {label}
                  </p>
                  <img
                    src={photos[idx]?.dataUrl}
                    alt={label}
                    className="w-full aspect-[3/4] object-cover rounded-2xl border"
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    {photos[idx] ? formatDate(photos[idx].date) : ''}
                    {photos[idx]?.weight ? ` · ${photos[idx].weight}kg` : ''}
                  </p>
                  <div className="flex justify-between">
                    <button
                      onClick={() => setIdx((v) => Math.max(0, v - 1))}
                      disabled={idx === 0}
                      className="p-1 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-muted-foreground">{idx + 1}/{photos.length}</span>
                    <button
                      onClick={() => setIdx((v) => Math.min(photos.length - 1, v + 1))}
                      disabled={idx === photos.length - 1}
                      className="p-1 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery mode */}
        {!compareMode && (
          <>
            {photos.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <ImageOff className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="font-medium">Nenhuma foto ainda</p>
                  <p className="text-sm text-muted-foreground">
                    Registre sua evolução com fotos ao longo do tratamento.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setPreviewIndex(i)}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden border group"
                  >
                    <img
                      src={photo.dataUrl}
                      alt="Progresso"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs font-medium">{formatDate(photo.date)}</p>
                      {photo.weight && (
                        <p className="text-white/80 text-xs">{photo.weight}kg</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <Button onClick={() => setAddOpen(true)} className="w-full gap-2">
              <Camera className="w-4 h-4" />
              Adicionar Foto
            </Button>
          </>
        )}
      </div>

      <BottomNav />

      {/* Add photo dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="w-[92vw] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Nova Foto de Progresso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                <Camera className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {newPhotoData ? 'Trocar foto' : 'Escolher foto'}
                </p>
              </div>
            </div>

            {newPhotoData && (
              <img
                src={newPhotoData}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-2xl border"
              />
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">Peso atual (opcional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 85.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Observação (opcional)</label>
              <input
                type="text"
                placeholder="Ex: Semana 4 de tratamento"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setAddOpen(false); setNewPhotoData(null); }} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={addPhoto} className="flex-1" disabled={!newPhotoData}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo preview dialog */}
      <Dialog open={previewIndex !== null} onOpenChange={() => setPreviewIndex(null)}>
        <DialogContent className="w-[95vw] max-w-sm rounded-2xl p-0 overflow-hidden">
          {previewIndex !== null && photos[previewIndex] && (
            <div className="relative">
              <img
                src={photos[previewIndex].dataUrl}
                alt="Progresso"
                className="w-full object-contain max-h-[70vh]"
              />
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{formatDate(photos[previewIndex].date)}</p>
                    {photos[previewIndex].weight && (
                      <p className="text-sm text-muted-foreground">{photos[previewIndex].weight}kg</p>
                    )}
                    {photos[previewIndex].note && (
                      <p className="text-sm text-muted-foreground">{photos[previewIndex].note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removePhoto(photos[previewIndex!].id)}
                    className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setPreviewIndex((v) => (v !== null ? Math.max(0, v - 1) : 0))}
                    disabled={previewIndex === 0}
                    className="p-2 disabled:opacity-30 rounded-full hover:bg-accent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-muted-foreground self-center">
                    {previewIndex + 1} / {photos.length}
                  </span>
                  <button
                    onClick={() => setPreviewIndex((v) => (v !== null ? Math.min(photos.length - 1, v + 1) : 0))}
                    disabled={previewIndex === photos.length - 1}
                    className="p-2 disabled:opacity-30 rounded-full hover:bg-accent"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgressPhotos;
