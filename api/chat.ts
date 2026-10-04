const SYSTEM_PROMPT = `Você é um assistente especializado em tratamentos com medicamentos GLP-1 (como Ozempic, Mounjaro, Wegovy, Saxenda, Trulicity e outros agonistas). Você ajuda pacientes a entender seu tratamento, efeitos colaterais, nutrição e estilo de vida.

Regras:
- Responda sempre em português do Brasil
- Seja empático, claro e objetivo
- Cite fontes médicas quando relevante
- Para sintomas graves (dor abdominal intensa, vômitos persistentes, pancreatite, reações alérgicas), oriente SEMPRE a buscar atendimento médico urgente
- Não substitua consultas médicas — reforce isso quando necessário
- Foque em orientações práticas sobre: doses, efeitos colaterais comuns, nutrição, hidratação, atividade física e adesão ao tratamento
- Seja breve (máx 3 parágrafos), mas completo`;

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 4000;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  medication?: string;
  currentDose?: string;
  frequency?: string;
}

const isChatMessage = (m: any): m is ChatMessage =>
  m &&
  (m.role === 'user' || m.role === 'assistant') &&
  typeof m.content === 'string' &&
  m.content.length <= MAX_CONTENT_LENGTH;

const field = (value: unknown) => (typeof value === 'string' && value.trim() ? value.slice(0, 100) : 'n/i');

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'OPENAI_API_KEY não configurada no servidor.' }, { status: 500 });
  }

  let body: { messages?: unknown; context?: ChatContext };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
  if (messages.length === 0 || !messages.every(isChatMessage)) {
    return Response.json({ error: 'Mensagens inválidas.' }, { status: 400 });
  }

  const context = body.context;
  const contextIntro = context?.medication
    ? `\n\n[Contexto do usuário: usa ${field(context.medication)}, dose ${field(context.currentDose)}, frequência ${field(context.frequency)}]`
    : '';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + contextIntro },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    return Response.json({ error: json?.error?.message || 'Erro na API da OpenAI.' }, { status: 502 });
  }

  const reply = json?.choices?.[0]?.message?.content ?? 'Não consegui responder. Tente novamente.';
  return Response.json({ reply });
}
