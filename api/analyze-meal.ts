import { z } from 'zod';
import { secureEndpoint, validators, Logger, errorResponse, jsonResponse } from './utils/security';

const SYSTEM_PROMPT =
  'Você é um nutricionista. Analise a refeição da imagem e retorne apenas um JSON com os campos: name (string), healthScore (0-100), nutrients { kcal (int), protein (int), carbs (int), fat (int), fiber (int) }, processingLevel (string). Não inclua texto fora do JSON.';

/**
 * Schema para validar response da OpenAI
 */
const MealAnalysisSchema = z.object({
  name: z.string(),
  healthScore: z.number().min(0).max(100),
  nutrients: z.object({
    kcal: z.number().int(),
    protein: z.number().int(),
    carbs: z.number().int(),
    fat: z.number().int(),
    fiber: z.number().int(),
  }),
  processingLevel: z.string(),
});

/**
 * Handler seguro para análise de pratos
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
    logger.warn('JSON inválido', { error: String(error) });
    return errorResponse('JSON inválido', 400, 'INVALID_JSON');
  }

  // Validar imagem com Zod
  const imageValidation = validators.image.safeParse((body as any)?.image);
  if (!imageValidation.success) {
    logger.warn('Imagem inválida', { errors: imageValidation.error.errors });
    return errorResponse(
      'Imagem inválida ou muito grande',
      400,
      'INVALID_IMAGE',
      imageValidation.error.errors
    );
  }

  const image = imageValidation.data;

  try {
    logger.info('Analisando prato com OpenAI', { imageSize: image.length });

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
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analise esta refeição e retorne somente JSON válido.' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
    });

    const openaiData = await openaiResponse.json().catch(() => null);

    if (!openaiResponse.ok) {
      const errorMsg = openaiData?.error?.message || 'OpenAI API error';
      logger.error('OpenAI error', { status: openaiResponse.status, error: errorMsg });
      return errorResponse(errorMsg, 502, 'OPENAI_ERROR');
    }

    // Extrair conteúdo
    const content = openaiData?.choices?.[0]?.message?.content;
    if (!content) {
      logger.error('OpenAI retornou resposta vazia');
      return errorResponse('Análise vazia da IA', 502, 'EMPTY_RESPONSE');
    }

    // Parsear e validar JSON
    let analysis: unknown;
    try {
      analysis = JSON.parse(content);
    } catch (error) {
      logger.error('JSON da OpenAI inválido', { content: content.slice(0, 200) });
      return errorResponse('Resposta da IA não é JSON válido', 502, 'INVALID_AI_RESPONSE');
    }

    // Validar schema com Zod
    const validatedAnalysis = MealAnalysisSchema.safeParse(analysis);
    if (!validatedAnalysis.success) {
      logger.error('Análise não atende ao schema', { errors: validatedAnalysis.error.errors });
      return errorResponse(
        'Resposta da IA não atende aos critérios',
        502,
        'INVALID_ANALYSIS_FORMAT',
        validatedAnalysis.error.errors
      );
    }

    logger.info('Análise concluída com sucesso', { name: validatedAnalysis.data.name });
    return jsonResponse(validatedAnalysis.data);
  } catch (error) {
    logger.error('Erro inesperado na análise', error);
    return errorResponse('Erro ao analisar prato', 500, 'ANALYSIS_ERROR');
  }
};

/**
 * Endpoint seguro
 */
export const POST = secureEndpoint(handler);
