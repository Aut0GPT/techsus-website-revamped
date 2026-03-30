import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, stepCountIs, wrapLanguageModel } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

// ─── Simple LRU-ish embedding cache (avoids redundant API calls) ─────────────
const embeddingCache = new Map<string, { embedding: number[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX = 50;

function getCachedEmbedding(key: string): number[] | null {
    const entry = embeddingCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) {
        embeddingCache.delete(key);
        return null;
    }
    return entry.embedding;
}

function setCachedEmbedding(key: string, embedding: number[]) {
    if (embeddingCache.size >= CACHE_MAX) {
        // Evict oldest
        const oldest = embeddingCache.keys().next().value;
        if (oldest) embeddingCache.delete(oldest);
    }
    embeddingCache.set(key, { embedding, ts: Date.now() });
}

// ─── Embed helper (shared between tool + middleware) ─────────────────────────
async function embedQuery(text: string): Promise<number[] | null> {
    // Check cache first
    const cached = getCachedEmbedding(text);
    if (cached) {
        console.log('  ⚡ Embedding cache HIT');
        return cached;
    }

    const t0 = Date.now();
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: { parts: [{ text }] },
                taskType: 'RETRIEVAL_QUERY',
                outputDimensionality: 768,
            }),
        }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const embedding = data.embedding?.values ?? null;
    console.log(`  ⏱  Embedding generated in ${Date.now() - t0}ms`);

    if (embedding) setCachedEmbedding(text, embedding);
    return embedding;
}

// ─── Hybrid search (vector + full-text, falls back to vector-only) ───────────
async function hybridSearch(query: string, matchCount = 5) {
    const t0 = Date.now();
    const embedding = await embedQuery(query);
    if (!embedding) return { data: null, error: 'embedding failed' };

    // Try hybrid_search first (requires the SQL function to exist)
    const hybrid = await supabase.rpc('hybrid_search', {
        query_text: query,
        query_embedding: embedding,
        match_count: matchCount,
    });

    if (!hybrid.error && hybrid.data?.length > 0) {
        console.log(`  🔍 Hybrid search: ${hybrid.data.length} results in ${Date.now() - t0}ms`);
        return { data: hybrid.data, error: null };
    }

    // Fallback: pure vector search (lower threshold to get results)
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
// Trivial messages that should skip RAG entirely
const SKIP_RAG_PATTERNS = /^(oi|olá|ola|hey|hi|hello|obrigado|obg|valeu|tchau|bye|ok|sim|não|nao|haha|kk|rsrs|\?|!)/i;

function createRagMiddleware() {
    return {
        specificationVersion: 'v3' as const,
        async transformParams({ params }: { params: any }) {
            try {
                // Get the last user message text
                const lastUser = [...(params.messages ?? [])].reverse().find((m: any) => m.role === 'user');
                if (!lastUser) return params;

                const text = typeof lastUser.content === 'string'
                    ? lastUser.content
                    : (lastUser.content as any[])?.find((p: any) => p.type === 'text')?.text ?? '';

                const trimmed = text.trim();

                // Skip RAG for short or trivial messages
                if (!trimmed || trimmed.length < 40 || SKIP_RAG_PATTERNS.test(trimmed)) {
                    console.log('  ⏭️  RAG middleware: skipped (trivial/short message)');
                    return params;
                }

                // Fetch top 2 relevant chunks with a 3s timeout
                const t0 = Date.now();
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 3000);
                try {
                    const { data: chunks } = await hybridSearch(trimmed, 2);
                    clearTimeout(timer);
                    if (!chunks || chunks.length === 0) {
                        console.log(`  🧠 RAG middleware: no results (${Date.now() - t0}ms)`);
                        return params;
                    }

                    const highConfidence = chunks.filter((c: any) => (c.similarity ?? 0) >= 0.6);
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
                return params; // never break the request
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

## Geração de Imagens — REGRA OBRIGATÓRIA
Você tem acesso ao tool generateImage que GERA IMAGENS REAIS.
⚠️ REGRA ABSOLUTA: Quando o usuário pedir para criar, gerar, fazer ou desenhar qualquer tipo de imagem, ilustração, gráfico, chart, slide, PowerPoint ou conteúdo visual, você DEVE OBRIGATORIAMENTE chamar o tool generateImage. NUNCA descreva em texto uma imagem que deveria ser gerada. NUNCA finja que gerou uma imagem. Você DEVE usar o tool.
- O prompt do tool DEVE ser em inglês e muito detalhado: descreva cores, layout, tipografia, estilo, composição.
- Para gráficos quadrados ou imagens avulsas, use aspectRatio "1:1".
- Quando o tool retornar success:true, a imagem já aparece automaticamente no chat — NÃO inclua a URL nem markdown ![...]() na sua resposta. Apenas comente brevemente o que foi gerado.
- Se o tool retornar success:false, informe o erro ao usuário.
- CRÍTICO: Gere UMA imagem por vez, em etapas separadas. Nunca chame generateImage múltiplas vezes em paralelo.

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
- Prompt em inglês, extremamente detalhado: tema, público, estilo corporativo TECHSUS, logotipo em destaque no centro ou topo, cores da marca (deep blue #003366, white, orange accent #FF6600), tipografia limpa, layout profissional
- Use aspectRatio "16:9"

**Slides 2 em diante:**
- SEMPRE passe o imageUrl retornado pelo slide anterior como \`referenceImageUrl\`
- No prompt, inclua: "consistent visual style with the reference slide, same color palette, same layout grid, same typography, TECHSUS logo bottom-right corner, 16:9 professional PowerPoint slide"
- Isso garante coesão visual entre todos os slides

**Regras absolutas:**
- Gere UM slide por vez — aguarde o resultado (success:true + imageUrl) antes de chamar o próximo
- Use aspectRatio "16:9" em TODOS os slides
- O logotipo da TECHSUS DEVE aparecer em todos os slides
- Após gerar todos os slides, escreva um resumo conciso: título de cada slide, mensagem principal, e uma dica de como usar a apresentação

## Pesquisa na Web
Você tem amplo conhecimento geral atualizado. Para perguntas sobre notícias, preços ou dados da web, use esse conhecimento diretamente. Só chame webSearch se o usuário pedir explicitamente uma pesquisa na web.

## Instruções
- Quando o usuário perguntar sobre documentos ou informações da empresa, use o tool searchDocuments
- Quando o usuário perguntar sobre informações atuais ou da web, use o tool webSearch
- Quando o usuário pedir QUALQUER tipo de imagem → CHAME generateImage IMEDIATAMENTE
- Sempre responda de forma útil e completa`;

const customConvertToCoreMessages = (uiMessages: any[]): any[] => {
    const coreMessages: any[] = [];
    for (const message of uiMessages) {
        if (message.role === 'user') {
            const content: any[] = [];

            // New AI SDK UIMessage format: text lives in message.parts[]
            // Legacy format: text lives in message.content (string)
            const textFromParts = (message.parts ?? [])
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('');
            const textValue = textFromParts || message.content || '';

            if (textValue) {
                content.push({ type: 'text', text: textValue });
            }

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

            if (content.length > 0) {
                coreMessages.push({ role: 'user', content });
            } else {
                console.warn('  ⚠️  Skipping user message with no text or attachments');
            }
        } else if (message.role === 'assistant') {
            // Collect tool parts from all formats:
            // - AI SDK v6 static:  type = "tool-{name}", fields: input, output, state
            // - AI SDK v6 dynamic: type = "dynamic-tool", toolName, input, output, state
            // - AI SDK v4 legacy:  type = "tool-invocation", toolInvocation: { toolName, args, result }
            // - Legacy array:      message.toolInvocations (present in old saved messages)
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

                // Text content
                const textFromParts = partsArr.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
                const textValue = textFromParts || message.content || '';
                if (textValue) assistantContent.push({ type: 'text', text: textValue });

                // v6 tool calls (ToolCallPart uses `input`, not `args`)
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

                // v4 legacy tool calls
                for (const p of legacyToolParts) {
                    const inv = p.toolInvocation ?? p;
                    assistantContent.push({
                        type: 'tool-call',
                        toolCallId: inv.toolCallId,
                        toolName: inv.toolName ?? 'unknown',
                        input: inv.input ?? inv.args ?? {},
                    });
                }

                // legacy toolInvocations array
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

                // Tool results
                const toolResults: any[] = [];

                // ToolResultPart in v6 uses `output: { type: 'json', value: ... }`, not `result`
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
                // Plain text assistant message
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

// ─── Strip messages with empty content (Gemini rejects empty parts) ──────────
function sanitizeMessages(messages: any[]): any[] {
    return messages.filter(m => {
        if (typeof m.content === 'string') return m.content.trim().length > 0;
        if (Array.isArray(m.content)) return m.content.length > 0;
        return false;
    });
}

// ─── Logger ──────────────────────────────────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    const t0 = Date.now();
    try {
        const url = new URL(req.url);
        const modelContext = url.searchParams.get('model') || 'gemini';
        const { messages }: { messages: any[] } = await req.json();

        const customOpenai = createOpenAI({ apiKey: process.env.openai_key || '' });

        const modelId = modelContext === 'chatgpt' ? 'gpt-4o-mini-search-preview' : 'gemini-3-flash-preview';
        // ChatGPT: use Responses API (has built-in web search)
        // Gemini: use standard chat completions (search via providerOptions grounding)
        const baseModel = modelContext === 'chatgpt'
            ? customOpenai.responses(modelId)
            : google(modelId);

        // Wrap model with RAG middleware (auto-injects relevant doc context)
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

            // ── Step control (max 5 slides + clarification + final text + buffer) ──
            stopWhen: stepCountIs(10),

            // Allow generateImage up to step 7 (covers 5 slides across any conversation flow).
            // After step 7, disable it to prevent runaway generation loops.
            prepareStep: async ({ stepNumber }) => {
                if (stepNumber >= 7) {
                    return {
                        activeTools: (modelContext === 'chatgpt'
                            ? ['searchDocuments', 'listDocuments', 'webSearch', 'getDateTime', 'calculateArea']
                            : ['searchDocuments', 'listDocuments', 'getDateTime', 'calculateArea']
                        ) as any,
                    };
                }
                return undefined;
            },

            // ── Thinking mode (Gemini extended reasoning for complex tasks) ────
            ...(modelContext !== 'chatgpt' ? {
                providerOptions: {
                    google: {
                        thinkingConfig: { thinkingBudget: 8000 },
                    },
                },
            } : {}),

            // ── Per-tool lifecycle logging ─────────────────────────────────────────────
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
                } else if (name === 'listDocuments') {
                    summary = `${output?.documents?.length ?? 0} doc(s)`;
                } else if (name === 'generateImage') {
                    summary = output?.success ? `✅ ${String(output.imageUrl ?? '').slice(0, 60)}…` : `❌ ${output?.message}`;
                } else if (name === 'webSearch') {
                    summary = `${output?.results?.length ?? 0} web result(s)`;
                } else {
                    summary = JSON.stringify(output).slice(0, 100);
                }
                console.log(`  ✅ ← ${name}  ${ms}ms  │  ${summary}`);
            },

            // ── Tools ─────────────────────────────────────────────────────────
            tools: {
                searchDocuments: tool({
                    description: 'Busca documentos relevantes na base de conhecimento da TECHSUS usando busca híbrida (semântica + palavras-chave). Use quando o usuário perguntar sobre documentos, processos, especificações técnicas, patentes ou qualquer informação que possa estar nos documentos da empresa.',
                    inputSchema: z.object({
                        query: z.string().optional().describe('Consulta em português para buscar nos documentos TECHSUS. Seja específico e use termos técnicos quando relevante.'),
                    }),
                    execute: async ({ query }) => {
                        try {
                            if (!query || query.trim() === '') {
                                return { results: [] as any[], message: 'A busca requer um termo (query). Tente novamente sendo específico no termo de busca.' };
                            }
                            const { data, error } = await hybridSearch(query, 5);

                            if (error || !data || data.length === 0) {
                                return { results: [] as any[], message: 'Nenhum documento relevante encontrado.' };
                            }

                            return {
                                results: data.map((doc: { content: string; similarity: number }) => ({
                                    content: doc.content,
                                    similarity: Number(doc.similarity?.toFixed(3)),
                                })),
                                message: `Encontrei ${data.length} trecho(s) relevante(s).`,
                            };
                        } catch {
                            return { results: [] as any[], message: 'Erro ao buscar documentos.' };
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

                // webSearch tool — only used by ChatGPT (Gemini uses google.tools.googleSearch natively)
                webSearch: tool({
                    description: 'Pesquisa informações atuais na internet. Use para notícias, dados de mercado, preços, informações sobre empresas, eventos recentes, ou qualquer coisa não coberta pelos documentos internos.',
                    inputSchema: z.object({
                        query: z.string().describe('Termo de busca em português ou inglês'),
                    }),
                    execute: async ({ query }) => {
                        console.log(`  🌐 webSearch (ChatGPT tool): "${query}"`);
                        return { query, message: 'Pesquisa delegada ao modelo de busca integrado.' };
                    },
                }),

                generateImage: tool({
                    description: 'Gera uma imagem a partir de uma descrição textual. Use para criar gráficos, ilustrações, mockups, slides de apresentação, diagramas, charts, ou qualquer conteúdo visual. Para PowerPoints, chame este tool uma vez por slide, passando o imageUrl do slide anterior em referenceImageUrl para manter consistência visual.',
                    inputSchema: z.object({
                        prompt: z.string().describe('Descrição detalhada em inglês da imagem a ser gerada. Seja muito específico sobre cores, layout, tipografia, estilo visual, composição e elementos.'),
                        aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).optional().describe('Proporção da imagem. Use 16:9 para slides/PowerPoint, 1:1 para imagens quadradas, 9:16 para vertical.'),
                        referenceImageUrl: z.string().optional().describe('URL da imagem de referência gerada anteriormente. Use para slides 2+ de uma apresentação, para manter consistência visual com o slide anterior.'),
                    }),
                    execute: async ({ prompt, aspectRatio = '16:9', referenceImageUrl }) => {
                        if (!prompt) {
                            return { success: false, message: 'Erro: O modelo não forneceu um prompt para a imagem.' };
                        }
                        try {
                            const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
                            if (!apiKey) return { success: false, message: 'Chave de API não configurada.' };

                            // ── Build multimodal parts array ──────────────────────────────
                            const requestParts: any[] = [];

                            // 1. TECHSUS logo (always included — helps Gemini incorporate it)
                            const logoBase64 = getLogoBase64();
                            if (logoBase64) {
                                requestParts.push({ inlineData: { mimeType: 'image/png', data: logoBase64 } });
                            }

                            // 2. Reference image from previous slide (for visual consistency)
                            if (referenceImageUrl) {
                                try {
                                    const refResponse = await fetch(referenceImageUrl);
                                    if (refResponse.ok) {
                                        const refBuffer = Buffer.from(await refResponse.arrayBuffer());
                                        const refMime = refResponse.headers.get('content-type') || 'image/jpeg';
                                        requestParts.push({ inlineData: { mimeType: refMime, data: refBuffer.toString('base64') } });
                                        console.log('  🔗 Reference slide included for consistency');
                                    }
                                } catch {
                                    console.warn('  ⚠️  Could not fetch reference image — continuing without it');
                                }
                            }

                            // 3. Text prompt
                            requestParts.push({ text: prompt });

                            console.log(`  📡 Calling Gemini image API (${requestParts.length} part(s))...`);
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 60000);
                            const response = await fetch(
                                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`,
                                {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        contents: [{ parts: requestParts }],
                                        generationConfig: { responseModalities: ['Image', 'Text'] },
                                    }),
                                    signal: controller.signal,
                                }
                            );
                            clearTimeout(timeoutId);

                            if (!response.ok) {
                                const errText = await response.text();
                                console.error('  ❌ Gemini image API error:', response.status, errText.slice(0, 200));
                                return { success: false, message: `Erro na API: ${response.status}. Tente novamente.` };
                            }

                            const data = await response.json();
                            const parts = data.candidates?.[0]?.content?.parts || [];
                            const partTypes = parts.map((p: any) => p.inlineData ? 'image' : 'text').join(', ');
                            console.log(`  📦 Parts: ${parts.length} (${partTypes})`);

                            for (const part of parts) {
                                if (part.inlineData) {
                                    try {
                                        const ext = part.inlineData.mimeType === 'image/png' ? 'png' : 'jpg';
                                        const fileName = `zeninho_${Date.now()}.${ext}`;
                                        const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                                        const { error: uploadError } = await supabase.storage
                                            .from('imagensgeradas')
                                            .upload(fileName, imageBuffer, { contentType: part.inlineData.mimeType, upsert: false });
                                        if (uploadError) {
                                            console.error('  ❌ Supabase upload error:', uploadError.message);
                                            return { success: true, imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, message: 'Imagem gerada (não salva no storage).' };
                                        }
                                        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                                            .from('imagensgeradas')
                                            .createSignedUrl(fileName, 60 * 60 * 24 * 365);
                                        if (signedUrlError || !signedUrlData?.signedUrl) {
                                            return { success: true, imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, message: 'Imagem gerada (erro ao gerar URL).' };
                                        }
                                        return { success: true, imageUrl: signedUrlData.signedUrl, message: 'Imagem gerada e salva com sucesso!' };
                                    } catch (uploadErr) {
                                        console.error('  ❌ Upload exception:', uploadErr);
                                        return { success: true, imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, message: 'Imagem gerada (falha no storage).' };
                                    }
                                }
                            }

                            const textParts = parts.filter((p: { text?: string }) => p.text);
                            if (textParts.length > 0) console.log('  ⚠️  Only text returned:', textParts[0].text?.slice(0, 100));
                            return { success: false, message: 'A API retornou texto em vez de imagem.' };
                        } catch (err: any) {
                            if (err.name === 'AbortError') {
                                console.error('  ❌ generateImage timeout');
                                return { success: false, message: 'A API de imagens excedeu o tempo limite.' };
                            }
                            console.error('  ❌ generateImage exception:', err);
                            return { success: false, message: 'Erro ao gerar a imagem.' };
                        }
                    },
                }),
            },

            // Gemini uses google.tools.googleSearch() (declared in tools above) —
            // on-demand Google Search, only called when the model decides it needs it.
            // This avoids the 20-30s overhead of always-on useSearchGrounding.

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
