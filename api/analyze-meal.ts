const SYSTEM_PROMPT =
  'Você é um nutricionista. Analise a refeição da imagem e retorne apenas um JSON com os campos: name (string), healthScore (0-100), nutrients { kcal (int), protein (int), carbs (int), fat (int), fiber (int) }, processingLevel (string). Não inclua texto fora do JSON.';

// O corpo de uma Vercel Function é limitado a 4,5 MB; o frontend já reduz a imagem antes de enviar.
const MAX_IMAGE_LENGTH = 4_000_000;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'OPENAI_API_KEY não configurada no servidor.' }, { status: 500 });
  }

  let body: { image?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const image = body.image;
  if (typeof image !== 'string' || !image.startsWith('data:image/') || image.length > MAX_IMAGE_LENGTH) {
    return Response.json({ error: 'Imagem inválida ou muito grande.' }, { status: 400 });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    return Response.json({ error: json?.error?.message || 'Falha na análise com OpenAI.' }, { status: 502 });
  }

  try {
    return Response.json(JSON.parse(json?.choices?.[0]?.message?.content ?? ''));
  } catch {
    return Response.json({ error: 'Resposta da OpenAI não veio em JSON válido.' }, { status: 502 });
  }
}
