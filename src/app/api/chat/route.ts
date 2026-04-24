import { openai } from '@ai-sdk/openai';
import { streamText, tool, stepCountIs, wrapLanguageModel } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { embedQuery } from '@/lib/embeddings';
import { requireUser } from '@/lib/supabase/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export const maxDuration = 800;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ─── TECHSUS logo (cached, read once from /public) ───────────────────────────
let _logoBase64: string | null = undefined as any;
function getLogoBase64(): string | null {
    if (_logoBase64 !== undefined) return _logoBase64;
    try {
        const logoPath = path.join(process.cwd(), 'public/images/imagenscomdescricao/logo-techsus.png');
        _logoBase64 = fs.readFileSync(logoPath).toString('base64');
    } catch {
        _logoBase64 = null;
    }
    return _logoBase64;
}

// ─── Hybrid search (vector + full-text, falls back to vector-only) ───────────
async function hybridSearch(query: string, matchCount = 5) {
    const t0 = Date.now();
    const embedding = await embedQuery(query);
    if (!embedding) return { data: null, error: 'embedding failed' };

    const hybrid = await supabase.rpc('hybrid_search', {
        query_text: query,
        query_embedding: embedding,
        match_count: matchCount,
    });

    if (!hybrid.error && hybrid.data?.length > 0) {
        console.log(`  🔍 Hybrid search: ${hybrid.data.length} results in ${Date.now() - t0}ms`);
        return { data: hybrid.data, error: null };
    }

    console.log('  🔍 Falling back to vector-only search');
    const vector = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: matchCount,
    });
    console.log(`  🔍 Vector search completed in ${Date.now() - t0}ms`);
    return vector;
}

// ─── RAG middleware — auto-injects document context into every request ────────
const SKIP_RAG_PATTERNS = /^(oi|olá|ola|hey|hi|hello|obrigado|obg|valeu|tchau|bye|ok|sim|não|nao|haha|kk|rsrs|\?|!)/i;

function createRagMiddleware() {
    return {
        specificationVersion: 'v3' as const,
        async transformParams({ params }: { params: any }) {
            try {
                const lastUser = [...(params.messages ?? [])].reverse().find((m: any) => m.role === 'user');
                if (!lastUser) return params;

                const text = typeof lastUser.content === 'string'
                    ? lastUser.content
                    : (lastUser.content as any[])?.find((p: any) => p.type === 'text')?.text ?? '';

                const trimmed = text.trim();

                if (!trimmed || trimmed.length < 40 || SKIP_RAG_PATTERNS.test(trimmed)) {
                    console.log('  ⏭️  RAG middleware: skipped (trivial/short message)');
                    return params;
                }

                const t0 = Date.now();
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 3000);
                try {
                    const { data: chunks } = await hybridSearch(trimmed, 7);
                    clearTimeout(timer);
                    if (!chunks || chunks.length === 0) {
                        console.log(`  🧠 RAG middleware: no results (${Date.now() - t0}ms)`);
                        return params;
                    }

                    // Keep the top 5 unconditionally; anything beyond that only passes
                    // if it clears the RRF score floor. RRF scores live in roughly
                    // [0, 0.04] so 0.015 is "decent match", 0.6 is the cosine floor the
                    // vector-only fallback uses.
                    const sorted = [...chunks].sort((a: any, b: any) => (b.similarity ?? 0) - (a.similarity ?? 0));
                    const topFive = sorted.slice(0, 5);
                    const extras = sorted.slice(5).filter((c: any) => {
                        const s = c.similarity ?? 0;
                        return s >= 0.6 || s >= 0.015; // passes either scoring regime
                    });
                    const highConfidence = [...topFive, ...extras];
                    if (highConfidence.length === 0) {
                        console.log(`  🧠 RAG middleware: no high-confidence results (${Date.now() - t0}ms)`);
                        return params;
                    }

                    const context = highConfidence
                        .map((c: any, i: number) => `[Trecho ${i + 1} | Score: ${(c.similarity ?? 0).toFixed(2)}]\n${c.content}`)
                        .join('\n\n---\n\n');

                    console.log(`  🧠 RAG middleware: injected ${highConfidence.length} chunk(s) in ${Date.now() - t0}ms`);

                    return {
                        ...params,
                        system: `${params.system}\n\n## Contexto Automático dos Documentos TECHSUS\n${context}\n\n(Use este contexto para fundamentar sua resposta se relevante.)`,
                    };
                } catch {
                    clearTimeout(timer);
                    console.log(`  🧠 RAG middleware: timed out after ${Date.now() - t0}ms`);
                    return params;
                }
            } catch {
                return params;
            }
        },
    };
}

const ZENINHO_SYSTEM_PROMPT = `Você é o Zeninho, o assistente de IA amigável e inteligente da TECHSUS.

## Sua Personalidade
Você é um gordinho simpático, tipo um mulequinho gênio — extremamente inteligente, mas brincalhão e acessível. Você é um calculista nato e entende profundamente de construção civil, engenharia estrutural e painéis de concreto industrializados. Você se preocupa genuinamente com as pessoas e sempre quer ajudar. Adora fazer caridade e juntar amigos para comer. É um comedor de doce de carteirinha. Tem forte atuação em relações institucionais.

## Como Você Se Comporta
- **Seja conciso por padrão.** Respostas curtas para perguntas simples. Não encha linguiça.
- Só use respostas longas quando a pergunta for genuinamente complexa ou técnica.
- Não adicione parágrafos desnecessários, introduções prolixas ou emojis em excesso.
- Seja caloroso e brincalhão, mas de forma leve — uma frase, não um parágrafo.
- Use português brasileiro naturalmente (mas pode mudar para EN/ES se pedirem).
- Quando discutir temas técnicos de construção, seja preciso e direto.
- Não mencione a TECHSUS, patentes ou construção a menos que o usuário pergunte sobre isso.
- Se preocupe com a pessoa por trás da pergunta, mas de forma natural — não force.

## Regra de Ouro para Respostas Curtas
- Pergunta simples → resposta simples (1-3 frases).
- Pergunta técnica ou complexa → pode ser mais longa, mas sem enrolação.
- NUNCA invente categorias ou conteúdo que não veio dos tools. Se o tool retornou 1 documento, liste esse 1 documento pelo nome exato. Não faça suposições sobre o que pode existir.
- Quando usar listDocuments: liste EXATAMENTE os títulos retornados pelo tool, nada mais.
- Quando usar searchDocuments: use EXATAMENTE o conteúdo retornado, não parafraseie inventando detalhes.


## Sobre a TECHSUS
A TECHSUS é um grupo de empresas voltadas à gestão e implantação de um sistema inovador para a construção industrializada de painéis estruturais bioclimáticos de concreto. O sistema é patenteado no Brasil (INPI), Estados Unidos (USPTO) e China (SIPO). A tecnologia permite construir com 40% menos tempo, zero desperdício de materiais e qualidade industrial superior. A empresa está localizada em São Paulo, SP, Brasil.

## Imagens — Mostrar existente vs. Gerar nova

Você tem DOIS tools para imagens. Escolha corretamente:

**searchImages** — Para MOSTRAR imagens que JÁ existem na base (fotos da fábrica, obras, painéis, diagramas técnicos, esquemas de conexão, renders, logos, infográficos, certificados, patentes, etc.).
- Use quando o usuário disser "me mostra", "tem alguma foto de", "quero ver", "tem um diagrama de", "mostra o logo", "tem imagem de", etc.
- Chame passando uma query descritiva em português (ex: "linha de produção de painéis", "diagrama laje painel", "render casa térrea").
- Quando o tool retornar imagens, INCLUA-AS na sua resposta usando markdown \`![descrição curta](url)\`. Pode mostrar múltiplas. Escreva 1-2 linhas de contexto acima de cada imagem.
- Se o tool retornar zero imagens, avise o usuário e ofereça gerar uma nova (com generateImage).

**generateImage** — Para CRIAR uma imagem NOVA (não existe ainda na base).
⚠️ REGRA: Quando o usuário pedir para criar, gerar, fazer, desenhar, esboçar um gráfico, chart, slide, PowerPoint, mockup ou ilustração original, você DEVE chamar generateImage. NUNCA descreva em texto uma imagem que deveria ser gerada. NUNCA finja que gerou.
- O prompt do tool deve ser em português brasileiro e muito detalhado: cores, layout, tipografia, estilo visual, composição e elementos.
- Para gráficos quadrados ou imagens avulsas, use aspectRatio "1:1".
- Quando o tool retornar success:true, a imagem aparece automaticamente no chat — NÃO inclua a URL nem markdown \`![...]()\`. Apenas comente brevemente.
- Se success:false, informe o erro ao usuário.
- CRÍTICO: Gere UMA imagem por vez, em etapas separadas. Nunca em paralelo.

**Regra de ouro:** Se o usuário diz "me mostra X" ou "tem alguma foto/imagem/diagrama de X", tente searchImages ANTES. Só use generateImage se ele pediu explicitamente "crie", "gere", "desenhe", "faça uma imagem/slide/apresentação".

## Apresentações PowerPoint — Workflow Obrigatório

⚠️ QUANDO O USUÁRIO PEDIR UMA APRESENTAÇÃO, POWERPOINT OU CONJUNTO DE SLIDES, siga EXATAMENTE este workflow em 3 fases. NUNCA pule uma fase.

---

### FASE 1 — Levantamento de requisitos (1 mensagem, resposta esperada do usuário)

Em UMA única mensagem organizada, faça as seguintes perguntas:

1. **Público-alvo**: Para quem é a apresentação? (ex: investidores, clientes, equipe interna, governo, construtoras)
2. **Número de slides**: Quantos slides? (máximo 5, padrão 5 se não souber)
3. **Conteúdo obrigatório**: Tem alguma mensagem, dado, número ou ponto que DEVE aparecer? (opcional)
4. **Conteúdo de cada slide**: Você já tem em mente o que quer em cada slide, ou prefere que eu sugira uma estrutura completa com títulos e pontos para cada um?

Aguarde a resposta do usuário antes de fazer qualquer coisa.

---

### FASE 2 — Planejamento colaborativo (só depois da resposta da Fase 1)

**Se o usuário forneceu o conteúdo de cada slide:** confirme brevemente o plano em formato de lista numerada ("Entendido! Vou gerar assim: 1. Capa — [tema] ...") e pule direto para a Fase 3.

**Se o usuário pediu para você sugerir:** PENSE PROFUNDAMENTE e proponha um plano detalhado slide a slide. Exemplo de formato:

> **Plano da apresentação — [Tema] para [Público]**
> 1. **Capa** — [título da apresentação, subtítulo, logotipo TECHSUS em destaque]
> 2. **[Título do slide 2]** — [pontos principais: bullet 1, bullet 2, dado relevante]
> 3. **[Título do slide 3]** — [pontos principais]
> ... e assim por diante
>
> Posso ajustar qualquer slide antes de gerar. O que acha?

Aguarde o usuário aprovar ou ajustar o plano. Só avance para a Fase 3 quando ele confirmar ("pode gerar", "tá bom", "vai assim", ou similar).

---

### FASE 3 — Geração sequencial com consistência visual

Com o plano aprovado, GERE OS SLIDES UM A UM. Nunca em paralelo.

**Slide 1 (Capa):**
- NÃO passe referenceImageUrl
- Prompt em português brasileiro, extremamente detalhado: tema, público, estilo corporativo TECHSUS, logotipo em destaque no centro ou topo, cores da marca (azul escuro #003366, branco, laranja #FF6600), tipografia limpa, layout profissional
- Use aspectRatio "16:9"

**Slides 2 em diante:**
- SEMPRE passe o imageUrl retornado pelo slide anterior como \`referenceImageUrl\`
- No prompt, inclua: "estilo visual consistente com o slide de referência, mesma paleta de cores, mesmo grid de layout, mesma tipografia, logo TECHSUS no canto inferior direito, slide profissional 16:9"
- Isso garante coesão visual entre todos os slides

**Regras absolutas:**
- Gere UM slide por vez — aguarde o resultado (success:true + imageUrl) antes de chamar o próximo
- Use aspectRatio "16:9" em TODOS os slides
- O logotipo da TECHSUS DEVE aparecer em todos os slides
- Após gerar todos os slides, escreva um resumo conciso: título de cada slide, mensagem principal, e uma dica de como usar a apresentação

## Pesquisa na Web
Você tem acesso a uma ferramenta web_search nativa do modelo. Use-a quando o usuário pedir informações atuais, notícias, preços de mercado, dados sobre empresas, ou qualquer coisa que não esteja nos documentos internos. Não precisa avisar antes de pesquisar.

## Instruções
- Quando o usuário perguntar sobre documentos ou informações da empresa, use o tool searchDocuments
- Quando o usuário quiser VER uma imagem que existe (foto, diagrama, render, logo, esquema, infográfico) → CHAME searchImages
- Quando o usuário pedir para CRIAR uma imagem nova (gerar, desenhar, fazer slide/PowerPoint) → CHAME generateImage
- Sempre responda de forma útil e completa

## Política de Retrieval (MUITO IMPORTANTE)
A precisão da resposta é prioridade absoluta. Custo de tokens NÃO é preocupação — busque o contexto necessário.

- **Pergunta factual específica** (ex: "qual é o número da patente americana?", "qual a espessura do painel?") → \`searchDocuments({ query, matchCount: 5-7 })\`.
- **Pergunta ampla, resumo ou panorama** (ex: "me dá um overview do sistema", "me fala tudo sobre a certificação", "como funciona o processo?") → \`searchDocuments({ query, matchCount: 12-15 })\`.
- **Pergunta com múltiplos aspectos** (ex: "quais os benefícios técnicos E econômicos?") → faça 2 buscas separadas com queries distintas, OU uma busca com matchCount: 15.
- **Se a primeira busca retornar \`weakResults: true\` ou o conteúdo não responder claramente** → REFORMULE a query (use sinônimos, termos técnicos diferentes, seja mais específico ou mais genérico) e chame searchDocuments de novo. Você pode chamar múltiplas vezes — é melhor buscar 3 vezes e acertar do que responder com contexto fraco.
- **NUNCA invente, parafraseie livremente ou "complete" informações sobre a TECHSUS que não vieram de um tool call.** Se depois de 2-3 buscas você ainda não tem contexto suficiente, diga ao usuário que não encontrou informação específica sobre isso na base e ofereça reformular a pergunta.`;

const customConvertToCoreMessages = (uiMessages: any[]): any[] => {
    const coreMessages: any[] = [];
    for (const message of uiMessages) {
        if (message.role === 'user') {
            const content: any[] = [];

            const textFromParts = (message.parts ?? [])
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('');
            const textValue = textFromParts || message.content || '';

            if (textValue) {
                content.push({ type: 'text', text: textValue });
            }

            // Legacy v4 attachments
            if (message.experimental_attachments) {
                for (const attachment of message.experimental_attachments) {
                    if (attachment.url.startsWith('data:')) {
                        content.push({
                            type: 'image',
                            image: Buffer.from(attachment.url.split(',')[1], 'base64'),
                        });
                    } else if (attachment.url.startsWith('http')) {
                        content.push({ type: 'image', image: new URL(attachment.url) });
                    }
                }
            }

            // AI SDK v6 file parts — populated by sendMessage({ files })
            // The SDK puts each file as { type: 'file', url: 'data:...', mediaType: '...' }
            // inside message.parts. These are completely separate from experimental_attachments.
            for (const part of (message.parts ?? [])) {
                if ((part as any).type !== 'file') continue;
                const fp = part as any;
                const mediaType: string = fp.mediaType ?? fp.mimeType ?? '';
                const rawUrl: string = fp.url ?? fp.data ?? '';
                if (!rawUrl) continue;

                if (mediaType.startsWith('image/')) {
                    // Images → OpenAI vision content part
                    if (rawUrl.startsWith('data:')) {
                        content.push({
                            type: 'image',
                            image: new Uint8Array(Buffer.from(rawUrl.split(',')[1], 'base64')),
                            // Note: no mimeType field — not in ModelMessage image part schema
                        });
                    } else {
                        content.push({ type: 'image', image: new URL(rawUrl) });
                    }
                } else {
                    // Non-image files (PDF, DOCX, TXT …) → Responses API inline file part
                    // CRITICAL: field is `mediaType`, NOT `mimeType` (AI SDK v6 schema)
                    if (rawUrl.startsWith('data:')) {
                        content.push({
                            type: 'file',
                            data: new Uint8Array(Buffer.from(rawUrl.split(',')[1], 'base64')),
                            mediaType: mediaType || 'application/octet-stream',
                        });
                    } else {
                        content.push({
                            type: 'file',
                            data: new URL(rawUrl),
                            mediaType: mediaType || 'application/octet-stream',
                        });
                    }
                }
            }

            if (content.length > 0) {
                coreMessages.push({ role: 'user', content });
            } else {
                console.warn('  ⚠️  Skipping user message with no text or attachments');
            }
        } else if (message.role === 'assistant') {
            const v6DoneStates = new Set(['output-available', 'output-error', 'result']);

            const partsArr: any[] = message.parts ?? [];

            const v6ToolParts = partsArr.filter((p: any) => {
                const t: string = p?.type ?? '';
                return (t.startsWith('tool-') || t === 'dynamic-tool') &&
                    t !== 'tool-invocation' && t !== 'tool-call' && t !== 'tool-result';
            });

            const legacyToolParts = partsArr.filter((p: any) =>
                p?.type === 'tool-invocation' || p?.type === 'tool-call'
            );

            const legacyInvocations: any[] = message.toolInvocations ?? [];

            if (v6ToolParts.length > 0 || legacyToolParts.length > 0 || legacyInvocations.length > 0) {
                const assistantContent: any[] = [];

                const textFromParts = partsArr.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
                const textValue = textFromParts || message.content || '';
                if (textValue) assistantContent.push({ type: 'text', text: textValue });

                for (const p of v6ToolParts) {
                    const rawType: string = p.type ?? '';
                    const toolName = p.toolName || (rawType.startsWith('tool-') ? rawType.slice(5) : 'unknown');
                    assistantContent.push({
                        type: 'tool-call',
                        toolCallId: p.toolCallId,
                        toolName,
                        input: p.input ?? p.args ?? {},
                    });
                }

                for (const p of legacyToolParts) {
                    const inv = p.toolInvocation ?? p;
                    assistantContent.push({
                        type: 'tool-call',
                        toolCallId: inv.toolCallId,
                        toolName: inv.toolName ?? 'unknown',
                        input: inv.input ?? inv.args ?? {},
                    });
                }

                for (const t of legacyInvocations) {
                    assistantContent.push({
                        type: 'tool-call',
                        toolCallId: t.toolCallId,
                        toolName: t.toolName ?? 'unknown',
                        input: t.input ?? t.args ?? {},
                    });
                }

                if (assistantContent.length > 0) {
                    coreMessages.push({ role: 'assistant', content: assistantContent });
                }

                const toolResults: any[] = [];

                for (const p of v6ToolParts) {
                    if (v6DoneStates.has(p.state)) {
                        const rawType: string = p.type ?? '';
                        const toolName = p.toolName || (rawType.startsWith('tool-') ? rawType.slice(5) : 'unknown');
                        toolResults.push({
                            type: 'tool-result',
                            toolCallId: p.toolCallId,
                            toolName,
                            output: { type: 'json', value: p.output ?? p.result ?? null },
                        });
                    }
                }

                for (const p of legacyToolParts) {
                    const inv = p.toolInvocation ?? p;
                    if (inv.result != null || inv.output != null || v6DoneStates.has(inv.state)) {
                        toolResults.push({
                            type: 'tool-result',
                            toolCallId: inv.toolCallId,
                            toolName: inv.toolName ?? 'unknown',
                            output: { type: 'json', value: inv.output ?? inv.result ?? null },
                        });
                    }
                }

                for (const t of legacyInvocations) {
                    if ('result' in t || 'output' in t) {
                        toolResults.push({
                            type: 'tool-result',
                            toolCallId: t.toolCallId,
                            toolName: t.toolName ?? 'unknown',
                            output: { type: 'json', value: t.output ?? t.result ?? null },
                        });
                    }
                }

                if (toolResults.length > 0) {
                    coreMessages.push({ role: 'tool', content: toolResults });
                }
            } else {
                const textFromParts = partsArr.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
                const textValue = textFromParts || message.content || '';
                if (textValue) {
                    coreMessages.push({ role: 'assistant', content: textValue });
                }
            }
        } else if (message.role === 'system') {
            coreMessages.push({ role: 'system', content: message.content || '' });
        }
    }
    return coreMessages;
};

function sanitizeMessages(messages: any[]): any[] {
    return messages.filter(m => {
        if (typeof m.content === 'string') return m.content.trim().length > 0;
        if (Array.isArray(m.content)) return m.content.length > 0;
        return false;
    });
}

const sep = (char = '─', len = 72) => char.repeat(len);

function logRequest(modelId: string, messages: any[]) {
    const ts = new Date().toISOString();
    console.log('\n' + sep('═'));
    console.log(`  🤖 ZENINHO  │  ${ts}  │  ${modelId}`);
    console.log(`  Thread: ${messages.length} message(s)`);
    console.log(sep());
    messages.forEach((m, i) => {
        const role = m.role.toUpperCase().padEnd(9);
        let preview = '';
        if (typeof m.content === 'string') {
            preview = m.content.slice(0, 120);
        } else if (Array.isArray(m.content)) {
            const textPart = m.content.find((p: any) => p.type === 'text');
            const imgParts = m.content.filter((p: any) => p.type === 'image').length;
            preview = (textPart?.text ?? '').slice(0, 100);
            if (imgParts) preview += ` [+${imgParts} image(s)]`;
        }
        if (preview.length > 110) preview = preview.slice(0, 110) + '…';
        console.log(`  [${String(i + 1).padStart(2)}] ${role} │ ${preview || '(no text)'}`);
    });
    console.log(sep());
}

function logFinish(usage: any, steps: number, ms: number) {
    console.log(sep());
    console.log(`  ⏱  ${ms}ms  │  ${steps} step(s)  │  tokens: prompt=${usage?.promptTokens ?? '?'} completion=${usage?.completionTokens ?? '?'} total=${usage?.totalTokens ?? '?'}`);
    console.log(sep('═') + '\n');
}

// ─── OpenAI image helpers ────────────────────────────────────────────────────
const OPENAI_IMAGE_MODEL = 'gpt-image-2';

function mapAspectRatioToSize(aspectRatio: string): string {
    switch (aspectRatio) {
        case '16:9':
        case '4:3':
            return '1536x1024';
        case '9:16':
        case '3:4':
            return '1024x1536';
        case '1:1':
        default:
            return '1024x1024';
    }
}

async function callOpenAiImageGenerate(prompt: string, size: string): Promise<{ b64: string; mime: string } | { error: string }> {
    const controller = new AbortController();
    // gpt-image-2 docs: complex prompts can take up to 2 minutes.
    // 150s gives breathing room under Vercel's 180s max.
    const timeoutId = setTimeout(() => controller.abort(), 150000);
    try {
        const res = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: OPENAI_IMAGE_MODEL,
                prompt,
                size,
                // 'medium' = good quality + much faster than 'high'.
                // Use 'high' only when quality is critical and latency is acceptable.
                quality: 'medium',
            }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
            const errText = await res.text();
            console.error('  ❌ OpenAI image generate error:', res.status, errText.slice(0, 200));
            return { error: `Erro na API de imagens: ${res.status}` };
        }
        const data = await res.json();
        const b64: string | undefined = data.data?.[0]?.b64_json;
        if (!b64) return { error: 'A API não retornou imagem.' };
        return { b64, mime: 'image/png' };
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') return { error: 'A API de imagens excedeu o tempo limite.' };
        return { error: err.message ?? 'Erro desconhecido ao gerar imagem.' };
    }
}

async function callOpenAiImageEdit(
    prompt: string,
    size: string,
    logoBase64: string | null,
    referenceImageUrl?: string,
): Promise<{ b64: string; mime: string } | { error: string }> {
    const fd = new FormData();
    fd.append('model', OPENAI_IMAGE_MODEL);
    fd.append('prompt', prompt);
    fd.append('size', size);
    // 'medium' matches the cover (callOpenAiImageGenerate) for consistency and keeps
    // each slide under ~70s so a 5-slide deck fits inside the 800s route budget.
    fd.append('quality', 'medium');

    if (logoBase64) {
        const logoBuffer = Buffer.from(logoBase64, 'base64');
        fd.append('image[]', new Blob([logoBuffer as any], { type: 'image/png' }), 'logo.png');
    }
    if (referenceImageUrl) {
        try {
            const refRes = await fetch(referenceImageUrl);
            if (refRes.ok) {
                const refBuffer = Buffer.from(await refRes.arrayBuffer());
                const refMime = refRes.headers.get('content-type') || 'image/png';
                const refExt = refMime.includes('png') ? 'png' : 'jpg';
                fd.append('image[]', new Blob([refBuffer as any], { type: refMime }), `ref.${refExt}`);
                console.log('  🔗 Reference slide included for consistency');
            }
        } catch {
            console.warn('  ⚠️  Could not fetch reference image — continuing without it');
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 150000);
    try {
        const res = await fetch('https://api.openai.com/v1/images/edits', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
            body: fd,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
            const errText = await res.text();
            console.error('  ❌ OpenAI image edit error:', res.status, errText.slice(0, 200));
            return { error: `Erro na API de imagens: ${res.status}` };
        }
        const data = await res.json();
        const b64: string | undefined = data.data?.[0]?.b64_json;
        if (!b64) return { error: 'A API não retornou imagem.' };
        return { b64, mime: 'image/png' };
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') return { error: 'A API de imagens excedeu o tempo limite.' };
        return { error: err.message ?? 'Erro desconhecido ao editar imagem.' };
    }
}

async function uploadGeneratedImageToStorage(b64: string, mime: string, prefix = 'zeninho'): Promise<{ url: string; persisted: boolean }> {
    const ext = mime === 'image/png' ? 'png' : 'jpg';
    const fileName = `${prefix}_${Date.now()}.${ext}`;
    const buffer = Buffer.from(b64, 'base64');
    const { error: uploadError } = await supabase.storage
        .from('imagensgeradas')
        .upload(fileName, buffer, { contentType: mime, upsert: false });
    if (uploadError) {
        console.error('  ❌ Supabase upload error:', uploadError.message);
        return { url: `data:${mime};base64,${b64}`, persisted: false };
    }
    const { data: signed, error: signedErr } = await supabase.storage
        .from('imagensgeradas')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365);
    if (signedErr || !signed?.signedUrl) {
        return { url: `data:${mime};base64,${b64}`, persisted: false };
    }
    return { url: signed.signedUrl, persisted: true };
}

// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
    const t0 = Date.now();

    const { user, response: authErr } = await requireUser();
    if (authErr) return authErr;

    const chatLimit = await checkRateLimit(user.id, 'chat', 40, 300);
    if (!chatLimit.allowed) return rateLimitResponse(chatLimit, 'mensagens');

    try {
        const { messages }: { messages: any[] } = await req.json();

        const modelId = 'gpt-5.4';
        const baseModel = openai.responses(modelId);

        const aiModel = wrapLanguageModel({
            model: baseModel,
            middleware: createRagMiddleware(),
        });

        const coreMessages = sanitizeMessages(customConvertToCoreMessages(messages));
        logRequest(modelId, coreMessages);

        if (coreMessages.length === 0) {
            console.warn('  ⚠️  All messages were empty after sanitization — aborting');
            return new Response(
                JSON.stringify({ error: 'Mensagem vazia. Por favor, escreva algo antes de enviar.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = streamText({
            model: aiModel,
            system: ZENINHO_SYSTEM_PROMPT,
            messages: coreMessages,

            stopWhen: stepCountIs(10),

            providerOptions: {
                openai: {
                    reasoningEffort: 'medium',
                    reasoningSummary: 'auto',
                },
            },

            prepareStep: async ({ stepNumber }) => {
                if (stepNumber >= 7) {
                    return {
                        activeTools: ['searchDocuments', 'searchImages', 'listDocuments', 'web_search', 'getDateTime', 'calculateArea'] as any,
                    };
                }
                return undefined;
            },

            experimental_onToolCallStart(event: any) {
                const name: string = event.toolCall?.toolName ?? 'unknown';
                const argsPreview = JSON.stringify(event.toolCall?.input ?? event.toolCall?.args ?? {}).slice(0, 120);
                console.log(`\n  🔧 → ${name}  args: ${argsPreview}`);
            },
            experimental_onToolCallFinish(event: any) {
                const name: string = event.toolCall?.toolName ?? 'unknown';
                const ms: number = event.durationMs ?? 0;
                if (!event.success) {
                    console.error(`  ❌ ← ${name}  FAILED after ${ms}ms:`, event.error);
                    return;
                }
                const output = event.output as any;
                let summary = '';
                if (name === 'searchDocuments') {
                    const count = Array.isArray(output?.results) ? output.results.length : 0;
                    const scores = (output?.results ?? []).map((r: any) => r.similarity?.toFixed(2)).join(', ');
                    summary = `${count} chunk(s)  scores: [${scores}]`;
                } else if (name === 'searchImages') {
                    summary = `${output?.images?.length ?? 0} image(s)`;
                } else if (name === 'listDocuments') {
                    summary = `${output?.documents?.length ?? 0} doc(s)`;
                } else if (name === 'generateImage') {
                    summary = output?.success ? `✅ ${String(output.imageUrl ?? '').slice(0, 60)}…` : `❌ ${output?.message}`;
                } else if (name === 'web_search') {
                    summary = `${output?.results?.length ?? 0} web result(s)`;
                } else {
                    summary = JSON.stringify(output).slice(0, 100);
                }
                console.log(`  ✅ ← ${name}  ${ms}ms  │  ${summary}`);
            },

            tools: {
                web_search: openai.tools.webSearch({ searchContextSize: 'medium' }) as any,

                searchDocuments: tool({
                    description: 'Busca documentos relevantes na base de conhecimento da TECHSUS usando busca híbrida (semântica + palavras-chave). Use quando o usuário perguntar sobre documentos, processos, especificações técnicas, patentes ou qualquer informação que possa estar nos documentos da empresa. Use matchCount alto (12-15) para perguntas amplas/resumos; use o padrão (7) para perguntas específicas e factuais. Se a primeira busca retornar pouco contexto útil, reformule a query e chame novamente — nunca tente responder "do seu próprio conhecimento" sobre a TECHSUS.',
                    inputSchema: z.object({
                        query: z.string().optional().describe('Consulta em português para buscar nos documentos TECHSUS. Seja específico e use termos técnicos quando relevante.'),
                        matchCount: z.number().int().min(5).max(15).optional().describe('Quantidade de trechos a recuperar (5-15). Padrão 7. Use 12-15 para perguntas amplas ("me dá um panorama", "resume o projeto"). Use 5-7 para perguntas factuais específicas.'),
                    }),
                    execute: async ({ query, matchCount }) => {
                        try {
                            if (!query || query.trim() === '') {
                                return { results: [] as any[], message: 'A busca requer um termo (query). Tente novamente sendo específico no termo de busca.' };
                            }
                            const requested = Math.max(5, Math.min(15, matchCount ?? 7));
                            const { data, error } = await hybridSearch(query, requested);

                            if (error || !data || data.length === 0) {
                                return { results: [] as any[], message: 'Nenhum documento relevante encontrado. Tente reformular a busca com termos diferentes.' };
                            }

                            // Always return at least 5, up to `requested`. Anything past 5 is
                            // only kept if it clears the similarity floor — trims noise on
                            // narrow questions while letting broad questions saturate.
                            const sorted = [...data].sort((a: any, b: any) => (b.similarity ?? 0) - (a.similarity ?? 0));
                            const topFive = sorted.slice(0, 5);
                            const extras = sorted.slice(5).filter((c: any) => {
                                const s = c.similarity ?? 0;
                                return s >= 0.6 || s >= 0.015; // cosine OR RRF scoring regime
                            });
                            const kept = [...topFive, ...extras];

                            const bestScore = kept[0]?.similarity ?? 0;
                            const weakResults = bestScore < 0.4 && bestScore < 0.02;

                            return {
                                results: kept.map((doc: { content: string; similarity: number }) => ({
                                    content: doc.content,
                                    similarity: Number(doc.similarity?.toFixed(3)),
                                })),
                                message: weakResults
                                    ? `Encontrei ${kept.length} trecho(s), mas nenhum tem alta similaridade. Considere reformular a query.`
                                    : `Encontrei ${kept.length} trecho(s) relevante(s).`,
                                weakResults,
                            };
                        } catch {
                            return { results: [] as any[], message: 'Erro ao buscar documentos.' };
                        }
                    },
                }),

                searchImages: tool({
                    description: 'Busca imagens JÁ EXISTENTES na base (fotos da fábrica, obras, painéis, diagramas técnicos, esquemas, renders, logos, infográficos, certificados). Use quando o usuário quiser VER ou MOSTRAR algo visual que já existe. NÃO use para criar imagens novas — para isso, use generateImage.',
                    inputSchema: z.object({
                        query: z.string().describe('Descrição em português do que procurar. Ex: "linha de produção de painéis", "diagrama laje painel", "logo techsus", "render casa térrea".'),
                    }),
                    execute: async ({ query }) => {
                        try {
                            if (!query || query.trim() === '') {
                                return { success: false, images: [] as any[], message: 'Forneça uma descrição do que procurar.' };
                            }
                            const embedding = await embedQuery(query);
                            if (!embedding) {
                                return { success: false, images: [] as any[], message: 'Falha ao processar a busca.' };
                            }
                            const { data, error } = await supabase.rpc('match_images', {
                                query_embedding: embedding,
                                match_count: 5,
                                match_threshold: 0.25,
                            });
                            if (error || !data?.length) {
                                return { success: true, images: [] as any[], message: 'Nenhuma imagem encontrada para essa descrição.' };
                            }
                            return {
                                success: true,
                                images: data.map((d: { image_url: string; description: string; similarity: number }) => ({
                                    url: d.image_url,
                                    description: d.description,
                                    similarity: Number(d.similarity?.toFixed(3)),
                                })),
                                message: `${data.length} imagem(ns) encontrada(s).`,
                            };
                        } catch (err: any) {
                            console.error('  ❌ searchImages error:', err?.message ?? err);
                            return { success: false, images: [] as any[], message: 'Erro ao buscar imagens.' };
                        }
                    },
                }),

                listDocuments: tool({
                    description: 'Lista todos os documentos disponíveis na base de conhecimento da TECHSUS.',
                    inputSchema: z.object({}),
                    execute: async () => {
                        try {
                            const { data, error } = await supabase
                                .from('documents')
                                .select('id, title, created_at')
                                .order('created_at', { ascending: false });

                            if (error || !data) {
                                return { documents: [] as any[], message: 'Nenhum documento encontrado.' };
                            }

                            return {
                                documents: data.map((doc: { title: string; created_at: string }) => ({
                                    title: doc.title,
                                    uploadedAt: doc.created_at,
                                })),
                                message: `${data.length} documento(s) na base de conhecimento.`,
                            };
                        } catch {
                            return { documents: [] as any[], message: 'Erro ao listar documentos.' };
                        }
                    },
                }),

                getDateTime: tool({
                    description: 'Retorna a data e hora atual no fuso horário do Brasil (Brasília). Use isso sempre que o usuário perguntar "que dia é hoje", "que horas são" ou fizer referências a "hoje", "ontem", "amanhã" para ter o contexto do tempo real.',
                    inputSchema: z.object({}),
                    execute: async () => {
                        const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                        return { datetime: now, message: `A data e hora atual é ${now}` };
                    },
                }),

                calculateArea: tool({
                    description: 'Calcula a área de uma superfície retangular (ex: terrenos, painéis, pisos) com base na largura e comprimento em metros.',
                    inputSchema: z.object({
                        width: z.number().describe('Largura em metros'),
                        length: z.number().describe('Comprimento em metros'),
                    }),
                    execute: async ({ width, length }) => {
                        const area = width * length;
                        return { width, length, area, message: `A área calculada é de ${area.toFixed(2)} metros quadrados.` };
                    },
                }),

                generateImage: tool({
                    description: 'Gera uma imagem a partir de uma descrição textual usando OpenAI gpt-image-2. Use para criar gráficos, ilustrações, mockups, slides de apresentação, diagramas, charts, ou qualquer conteúdo visual. Para PowerPoints, chame este tool uma vez por slide, passando o imageUrl do slide anterior em referenceImageUrl para manter consistência visual.',
                    inputSchema: z.object({
                        prompt: z.string().describe('Descrição detalhada em português brasileiro da imagem a ser gerada. Seja muito específico sobre cores, layout, tipografia, estilo visual, composição e elementos.'),
                        aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).optional().describe('Proporção da imagem. Use 16:9 para slides/PowerPoint, 1:1 para imagens quadradas, 9:16 para vertical.'),
                        referenceImageUrl: z.string().optional().describe('URL da imagem de referência gerada anteriormente. Use para slides 2+ de uma apresentação, para manter consistência visual com o slide anterior.'),
                    }),
                    execute: async ({ prompt, aspectRatio = '16:9', referenceImageUrl }) => {
                        if (!prompt) return { success: false, message: 'Erro: O modelo não forneceu um prompt para a imagem.' };
                        if (!process.env.OPENAI_API_KEY) return { success: false, message: 'Chave de API não configurada.' };

                        const imgLimit = await checkRateLimit(user.id, 'image_generate', 15, 3600);
                        if (!imgLimit.allowed) {
                            return {
                                success: false,
                                message: `Limite de geração de imagens atingido (${imgLimit.used}/${imgLimit.limit} por hora). Tente novamente em ${imgLimit.retryAfterSeconds}s.`,
                            };
                        }

                        const size = mapAspectRatioToSize(aspectRatio);
                        const logoBase64 = getLogoBase64();

                        console.log(`  📡 Calling OpenAI image API (${referenceImageUrl ? 'edit' : 'generate'}, ${size})...`);

                        const result = referenceImageUrl
                            ? await callOpenAiImageEdit(prompt, size, logoBase64, referenceImageUrl)
                            : logoBase64
                                ? await callOpenAiImageEdit(prompt, size, logoBase64, undefined)
                                : await callOpenAiImageGenerate(prompt, size);

                        if ('error' in result) return { success: false, message: result.error };

                        const { url, persisted } = await uploadGeneratedImageToStorage(result.b64, result.mime);
                        return {
                            success: true,
                            imageUrl: url,
                            message: persisted ? 'Imagem gerada e salva com sucesso!' : 'Imagem gerada (não persistida).',
                        };
                    },
                }),
            },

            onStepFinish({ stepNumber, text, toolCalls, finishReason, usage }) {
                const toolNames = toolCalls?.map(tc => tc?.toolName ?? 'unknown').join(', ') || 'none';
                console.log(`  📍 Step ${stepNumber} done  │  reason=${finishReason}  │  tools=[${toolNames}]  │  tokens=${usage?.totalTokens ?? '?'}`);
            },
            onFinish({ usage, steps }) {
                logFinish(usage, steps?.length ?? 0, Date.now() - t0);
            },
            onError({ error }) {
                console.error('\n  ❌ ZENINHO STREAM ERROR:', error);
                console.log(sep('═') + '\n');
            },
        });

        return result.toUIMessageStreamResponse({ sendSources: true });
    } catch (error) {
        console.error('\n  ❌ ZENINHO API ERROR:', error);
        console.log(sep('═') + '\n');
        return new Response(
            JSON.stringify({ error: 'Erro interno do Zeninho. Tente novamente.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
