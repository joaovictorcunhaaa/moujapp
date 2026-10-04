import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNav from '@/components/BottomNav';
import { useOnboarding } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const OPENAI_API_KEY = 'sua-chave-api-aqui';

const SYSTEM_PROMPT = `Você é um assistente especializado em tratamentos com medicamentos GLP-1 (como Ozempic, Mounjaro, Wegovy, Saxenda, Trulicity e outros agonistas). Você ajuda pacientes a entender seu tratamento, efeitos colaterais, nutrição e estilo de vida.

Regras:
- Responda sempre em português do Brasil
- Seja empático, claro e objetivo
- Cite fontes médicas quando relevante
- Para sintomas graves (dor abdominal intensa, vômitos persistentes, pancreatite, reações alérgicas), oriente SEMPRE a buscar atendimento médico urgente
- Não substitua consultas médicas — reforce isso quando necessário
- Foque em orientações práticas sobre: doses, efeitos colaterais comuns, nutrição, hidratação, atividade física e adesão ao tratamento
- Seja breve (máx 3 parágrafos), mas completo`;

const SUGGESTED_QUESTIONS = [
  'Como reduzir náuseas com o tratamento?',
  'O que comer nas primeiras semanas?',
  'Quanto tempo para ver resultado?',
  'Posso beber álcool usando GLP-1?',
  'Como armazenar a caneta?',
  'Devo aplicar sempre no mesmo local?',
];

const AiChat = () => {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem('moujapp-chat');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    try {
      localStorage.setItem('moujapp-chat', JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const contextIntro = data.medication
      ? `[Contexto do usuário: usa ${data.medication}, dose ${data.currentDose || 'n/i'}, frequência ${data.frequency || 'n/i'}]`
      : '';

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + (contextIntro ? `\n\n${contextIntro}` : '') },
            ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Erro na API');
      const reply = json.choices?.[0]?.message?.content ?? 'Não consegui responder. Tente novamente.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Erro: ${err?.message || 'Falha na conexão. Verifique sua chave de API.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('moujapp-chat');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full border hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-none">IA GLP-1</p>
                <p className="text-xs text-muted-foreground">Tire suas dúvidas</p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground"
              title="Limpar conversa"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-bold text-lg">Olá! Sou seu assistente GLP-1</h2>
                <p className="text-sm text-muted-foreground px-4">
                  Pode me perguntar sobre seu tratamento, efeitos colaterais, alimentação e muito mais.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Perguntas frequentes
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-2 rounded-full border bg-muted hover:bg-accent transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                )}
              >
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2">
            <Input
              placeholder="Escreva sua dúvida..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              disabled={loading}
              className="flex-1 rounded-full"
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              size="icon"
              className="rounded-full w-10 h-10 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Não substitui consulta médica profissional
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AiChat;
