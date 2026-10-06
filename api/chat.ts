import { z } from 'zod';
import { secureEndpoint, validators, Logger, errorResponse, jsonResponse } from './utils/security';

/**
 * ⚠️ DISCLAIMER IMPORTANTE: Este assistente NÃO substitui orientação médica profissional
 * Sempre recomende que o usuário consulte seu médico
 */
const SYSTEM_PROMPT = `Você é um assistente especializado em tratamentos com medicamentos GLP-1 (como Ozempic, Mounjaro, Wegovy, Saxenda, Trulicity e outros agonistas). Você ajuda pacientes a entender seu tratamento, efeitos colaterais, nutrição e estilo de vida.

⚠️ AVISO CRÍTICO - VOCÊ DEVE SEMPRE CUMPRIR ESTAS REGRAS:
- NUNCA substitua orientação médica profissional
- Para sintomas GRAVES (dor abdominal intensa, vômitos persistentes, pancreatite, reações alérgicas, dificuldade de respirar), oriente SEMPRE a buscar atendimento URGENTE
- Reforce em cada resposta que isso é informacional e não médico
- Se o usuário relatar sintomas graves, PARE a conversa e redirecione para emergência

Regras de comportamento:
- Responda sempre em português do Brasil
- Seja empático, claro e objetivo
- Cite fontes médicas quando relevante
- Não substitua consultas médicas — reforce isso quando necessário
- Foque em orientações práticas sobre: doses, efeitos colaterais comuns, nutrição, hidratação, atividade física e adesão ao tratamento
- Seja breve (máx 3 parágrafos), mas completo
- Comece com: "⚠️ Lembre-se: sou um assistente de IA, não um médico. Sempre consulte seu médico para orientação médica."`;

const field = (value: unknown) => (typeof value === 'string' && value.trim() ? value.slice(0, 100) : 'não informado');

/**
 * Validar se a mensagem é sobre emergência médica
 */
const isEmergencyKeyword = (content: string): boolean => {
  const emergencyWords = [
    'dor abdominal intensa',
    'vômito persistente',
    'pancreatite',
    'reação alérgica',
    'dificuldade respirar',
    'desmaio',
    'convulsão',
    'sangramento',
    'emergência',
    'urgente',
    'pronto socorro',
    'ambulância',
  ];

  const lower = content.toLowerCase();
  return emergencyWords.some(word => lower.includes(word));
};

/**
 * Handler seguro para chat
 */
const handler = async (request: Request, logger: Logger): Promise<Response> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logger.error('OPENAI_API_KEY não configurada');
    return errorResponse('API não configurada', 500, 'API_NOT_CONFIGURED');
  }

  // Validar JSON
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    logger.warn('JSON inválido');
    return errorResponse('JSON inválido', 400, 'INVALID_JSON');
  }

  // Validar mensagens
  const bodyObj = body as any;
  const messagesValidation = validators.chatMessages.safeParse(bodyObj?.messages);

  if (!messagesValidation.success) {
    logger.warn('Mensagens inválidas', { errors: messagesValidation.error.errors });
    return errorResponse(
      'Mensagens inválidas',
      400,
      'INVALID_MESSAGES',
      messagesValidation.error.errors
    );
  }

  // Validar contexto (opcional)
  const contextValidation = validators.chatContext.safeParse(bodyObj?.context);
  const context = contextValidation.success ? contextValidation.data : undefined;

  // Extrair última mensagem do usuário
  const messages = messagesValidation.data;
  const lastUserMessage = messages.findLast((m) => m.role === 'user')?.content || '';

  // ⚠️ VERIFICAR EMERGÊNCIA
  if (isEmergencyKeyword(lastUserMessage)) {
    logger.warn('Mensagem com palavra-chave de emergência detectada', { keyword: lastUserMessage.slice(0, 50) });
    return jsonResponse({
      reply: `🚨 EMERGÊNCIA MÉDICA DETECTADA

Baseado na sua mensagem, você pode estar enfrentando uma situação de emergência médica.

⚠️ PROCURE ATENDIMENTO MÉDICO URGENTE IMEDIATAMENTE:
📞 Ligue para 192 (SAMU) ou 911
🏥 Vá ao pronto socorro mais próximo
👨‍⚕️ Chame uma ambulância

Este assistente de IA NÃO pode ajudar com emergências. Você precisa de um médico AGORA.

Sua segurança é a prioridade.`,
      isEmergency: true,
    });
  }

  // Construir contexto
  const contextIntro = context?.medication
    ? `\n\n[Contexto do usuário: usa ${field(context.medication)}, dose ${field(context.currentDose)}, frequência ${field(context.frequency)}]`
    : '';

  try {
    logger.info('Enviando para OpenAI', { messageCount: messages.length });

    // Chamar OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    const openaiData = await openaiResponse.json().catch(() => null);

    if (!openaiResponse.ok) {
      const errorMsg = openaiData?.error?.message || 'OpenAI API error';
      logger.error('OpenAI error', { status: openaiResponse.status, error: errorMsg });
      return errorResponse(errorMsg, 502, 'OPENAI_ERROR');
    }

    const reply = openaiData?.choices?.[0]?.message?.content || 'Não consegui responder. Tente novamente.';

    logger.info('Chat concluído com sucesso');
    return jsonResponse({ reply, isEmergency: false });
  } catch (error) {
    logger.error('Erro inesperado no chat', error);
    return errorResponse('Erro ao processar chat', 500, 'CHAT_ERROR');
  }
};

/**
 * Endpoint seguro
 */
export const POST = secureEndpoint(handler);
