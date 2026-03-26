import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 120;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const ZENINHO_SYSTEM_PROMPT = `Você é o Zeninho, o assistente de IA amigável e inteligente da TECHSUS.

## Sua Personalidade
Você é um gordinho simpático, tipo um mulequinho gênio — extremamente inteligente, mas brincalhão e acessível. Você é um calculista nato e entende profundamente de construção civil, engenharia estrutural e painéis de concreto industrializados. Você se preocupa genuinamente com as pessoas e sempre quer ajudar. Adora fazer caridade e juntar amigos para comer. É um comedor de doce de carteirinha. Tem forte atuação em relações institucionais.

## Como Você Se Comporta
- Seja sempre caloroso, acessível e um pouco brincalhão
- Use português brasileiro naturalmente (mas pode mudar para EN/ES se pedirem)
- Quando discutir temas técnicos de construção, seja preciso e conhecedor
- De vez em quando mencione seu amor por doces ou comida de forma charmosa
- Se preocupe com a pessoa por trás da pergunta — pergunte se precisa de mais ajuda
- Use seus tools quando relevante para buscar documentos ou pesquisar na web
- Seja direto e eficiente nas respostas, mas sem perder o charme

## Sobre a TECHSUS
A TECHSUS é um grupo de empresas voltadas à gestão e implantação de um sistema inovador para a construção industrializada de painéis estruturais bioclimáticos de concreto. O sistema é patenteado no Brasil (INPI), Estados Unidos (USPTO) e China (SIPO). A tecnologia permite construir com 40% menos tempo, zero desperdício de materiais e qualidade industrial superior. A empresa está localizada em São Paulo, SP, Brasil.

## Geração de Imagens — REGRA OBRIGATÓRIA
Você tem acesso ao tool generateImage que GERA IMAGENS REAIS.
⚠️ REGRA ABSOLUTA: Quando o usuário pedir para criar, gerar, fazer ou desenhar qualquer tipo de imagem, ilustração, gráfico, chart, slide, PowerPoint ou conteúdo visual, você DEVE OBRIGATORIAMENTE chamar o tool generateImage. NUNCA descreva em texto uma imagem que deveria ser gerada. NUNCA finja que gerou uma imagem. Você DEVE usar o tool.
- O prompt do tool DEVE ser em inglês e bem detalhado
- Para slides/PowerPoint, use aspectRatio "16:9"
- Para gráficos quadrados, use "1:1"
- IMPORTANTÍSSIMO: Quando o tool retornar success:true, você DEVE incluir a imagem na sua resposta usando EXATAMENTE este formato markdown: ![Descrição da imagem](URL_DA_IMAGEM) — substitua URL_DA_IMAGEM pela imageUrl retornada pelo tool. Isso é OBRIGATÓRIO para a imagem aparecer no chat.
- Após incluir a imagem em markdown, faça um breve comentário sobre ela.
- Se o tool retornar success:false, informe o usuário do erro.

## Instruções
- Quando o usuário perguntar sobre documentos ou informações da empresa, use o tool searchDocuments para buscar nos documentos cadastrados
- Quando o usuário perguntar sobre informações atuais ou da web, responda com base no seu conhecimento
- Quando o usuário pedir QUALQUER tipo de imagem, gráfico, ilustração ou PowerPoint → CHAME o tool generateImage IMEDIATAMENTE. Não descreva a imagem em texto.
- SEMPRE inclua a URL da imagem gerada como markdown ![desc](url) na sua resposta
- Sempre responda de forma útil e completa`;

const customConvertToCoreMessages = (uiMessages: any[]): any[] => {
    const coreMessages: any[] = [];
    for (const message of uiMessages) {
        if (message.role === 'user') {
            const content: any[] = [];
            if (message.content) {
                content.push({ type: 'text', text: message.content });
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
                coreMessages.push({ role: 'user', content: '' });
            }
        } else if (message.role === 'assistant') {
            if (message.toolInvocations && message.toolInvocations.length > 0) {
                const assistantContent: any[] = [];
                if (message.content) {
                    assistantContent.push({ type: 'text', text: message.content });
                }
                for (const t of message.toolInvocations) {
                    assistantContent.push({
                        type: 'tool-call',
                        toolCallId: t.toolCallId,
                        toolName: t.toolName,
                        args: t.args
                    });
                }
                coreMessages.push({
                    role: 'assistant',
                    content: assistantContent
                });

                const results = message.toolInvocations.filter((t: any) => 'result' in t);
                if (results.length > 0) {
                    coreMessages.push({
                        role: 'tool',
                        content: results.map((t: any) => ({
                            type: 'tool-result',
                            toolCallId: t.toolCallId,
                            toolName: t.toolName,
                            result: t.result
                        }))
                    });
                }
            } else {
                coreMessages.push({ role: 'assistant', content: message.content || '' });
            }
        } else if (message.role === 'system') {
            coreMessages.push({ role: 'system', content: message.content || '' });
        }
    }
    return coreMessages;
};

// ─── Rich logger ────────────────────────────────────────────────────────────
const sep = (char = '─', len = 72) => char.repeat(len);

function logRequest(modelId: string, messages: any[]) {
    const ts = new Date().toISOString();
    console.log('\n' + sep('═'));
    console.log(`  🤖 ZENINHO REQUEST  │  ${ts}`);
    console.log(`  Model : ${modelId}`);
    console.log(`  Thread: ${messages.length} message(s) in context`);
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

function logToolCall(step: number, name: string, args: any) {
    console.log(`\n  🔧 TOOL CALL  [step ${step}] → ${name}`);
    const argsStr = JSON.stringify(args, null, 2)
        .split('\n')
        .map(l => '       ' + l)
        .join('\n');
    console.log(argsStr);
}

function logToolResult(name: string, result: any) {
    let summary = '';
    if (name === 'searchDocuments') {
        const count = Array.isArray(result?.results) ? result.results.length : 0;
        summary = `${count} doc chunk(s) found — ${result?.message ?? ''}`;
    } else if (name === 'listDocuments') {
        const count = Array.isArray(result?.documents) ? result.documents.length : 0;
        summary = `${count} document(s) listed`;
    } else if (name === 'generateImage') {
        summary = result?.success
            ? `✅ Image generated → ${(result.imageUrl ?? '').slice(0, 80)}…`
            : `❌ Failed — ${result?.message}`;
    } else {
        summary = JSON.stringify(result).slice(0, 120);
    }
    console.log(`  ✅ TOOL RESULT ← ${name}: ${summary}`);
}

function logFinish(usage: any, steps: number, ms: number) {
    console.log(sep());
    console.log(`  ⏱  Finished in   ${ms} ms  │  ${steps} step(s)`);
    if (usage) {
        console.log(`  📊 Tokens       prompt=${usage.promptTokens ?? '?'}  completion=${usage.completionTokens ?? '?'}  total=${usage.totalTokens ?? '?'}`);
    }
    console.log(sep('═') + '\n');
}
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    const t0 = Date.now();
    try {
        const url = new URL(req.url);
        const modelContext = url.searchParams.get('model') || 'gemini';
        const { messages }: { messages: any[] } = await req.json();

        const customOpenai = createOpenAI({
            apiKey: process.env.openai_key || '',
        });

        const modelId = modelContext === 'chatgpt' ? 'gpt-5.4-mini' : 'gemini-3-flash-preview';
        const aiModel = modelContext === 'chatgpt' ? customOpenai(modelId) : google(modelId);

        const coreMessages = customConvertToCoreMessages(messages);
        logRequest(modelId, coreMessages);

        let stepCount = 0;

        const result = streamText({
            model: aiModel,
            system: ZENINHO_SYSTEM_PROMPT,
            messages: coreMessages,
            tools: {
                searchDocuments: tool({
                    description: 'Busca documentos relevantes na base de conhecimento da TECHSUS. Use quando o usuário perguntar sobre documentos, processos, especificações técnicas ou qualquer informação que possa estar nos documentos da empresa.',
                    inputSchema: z.object({
                        query: z.string().describe('A consulta de busca para encontrar documentos relevantes'),
                    }),
                    execute: async ({ query }) => {
                        stepCount++;
                        logToolCall(stepCount, 'searchDocuments', { query });
                        try {
                            const embeddingResponse = await fetch(
                                `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
                                {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        content: { parts: [{ text: query }] },
                                        taskType: 'RETRIEVAL_QUERY',
                                        outputDimensionality: 768,
                                    }),
                                }
                            );

                            if (!embeddingResponse.ok) {
                                const r = { results: [] as string[], message: 'Não consegui buscar nos documentos no momento.' };
                                logToolResult('searchDocuments', r);
                                return r;
                            }

                            const embeddingData = await embeddingResponse.json();
                            const queryEmbedding = embeddingData.embedding?.values;

                            if (!queryEmbedding) {
                                const r = { results: [] as string[], message: 'Não consegui processar a busca.' };
                                logToolResult('searchDocuments', r);
                                return r;
                            }

                            const { data, error } = await supabase.rpc('match_documents', {
                                query_embedding: queryEmbedding,
                                match_threshold: 0.5,
                                match_count: 5,
                            });

                            if (error || !data || data.length === 0) {
                                const r = { results: [] as string[], message: 'Nenhum documento relevante encontrado.' };
                                logToolResult('searchDocuments', r);
                                return r;
                            }

                            const r = {
                                results: data.map((doc: { content: string; similarity: number }) => ({
                                    content: doc.content,
                                    similarity: doc.similarity,
                                })),
                                message: `Encontrei ${data.length} trecho(s) relevante(s).`,
                            };
                            logToolResult('searchDocuments', r);
                            return r;
                        } catch {
                            const r = { results: [] as string[], message: 'Erro ao buscar documentos.' };
                            logToolResult('searchDocuments', r);
                            return r;
                        }
                    },
                }),
                listDocuments: tool({
                    description: 'Lista todos os documentos disponíveis na base de conhecimento da TECHSUS.',
                    inputSchema: z.object({}),
                    execute: async () => {
                        stepCount++;
                        logToolCall(stepCount, 'listDocuments', {});
                        try {
                            const { data, error } = await supabase
                                .from('documents')
                                .select('id, title, created_at')
                                .order('created_at', { ascending: false });

                            if (error || !data) {
                                const r = { documents: [] as string[], message: 'Nenhum documento encontrado.' };
                                logToolResult('listDocuments', r);
                                return r;
                            }

                            const r = {
                                documents: data.map((doc: { title: string; created_at: string }) => ({
                                    title: doc.title,
                                    uploadedAt: doc.created_at,
                                })),
                                message: `${data.length} documento(s) na base de conhecimento.`,
                            };
                            logToolResult('listDocuments', r);
                            return r;
                        } catch {
                            const r = { documents: [] as string[], message: 'Erro ao listar documentos.' };
                            logToolResult('listDocuments', r);
                            return r;
                        }
                    },
                }),
                generateImage: tool({
                    description:
                        'Gera uma imagem a partir de uma descrição textual. Use para criar gráficos, ilustrações, mockups, slides de apresentação, diagramas, charts, ou qualquer conteúdo visual que o usuário solicitar. Para PowerPoints, chame este tool uma vez por slide.',
                    inputSchema: z.object({
                        prompt: z
                            .string()
                            .describe(
                                'Descrição detalhada em inglês da imagem a ser gerada. Seja específico sobre cores, layout, texto, e estilo visual.'
                            ),
                        aspectRatio: z
                            .enum(['1:1', '16:9', '9:16', '4:3', '3:4'])
                            .optional()
                            .describe(
                                'Proporção da imagem. Use 16:9 para slides/PowerPoint, 1:1 para fotos quadradas, 9:16 para stories/vertical.'
                            ),
                    }),
                    execute: async ({ prompt, aspectRatio = '16:9' }) => {
                        stepCount++;
                        logToolCall(stepCount, 'generateImage', { prompt: prompt.slice(0, 100), aspectRatio });
                        try {
                            const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
                            if (!apiKey) {
                                const r = { success: false, message: 'Chave de API não configurada.' };
                                logToolResult('generateImage', r);
                                return r;
                            }

                            const requestBody = {
                                contents: [{ parts: [{ text: prompt }] }],
                                generationConfig: { responseModalities: ['Image', 'Text'] },
                            };

                            console.log('  📡 Calling Gemini image API...');
                            const response = await fetch(
                                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`,
                                {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(requestBody),
                                }
                            );

                            if (!response.ok) {
                                const errText = await response.text();
                                console.error('  ❌ Gemini image API error:', response.status, errText.slice(0, 200));
                                const r = { success: false, message: `Erro na API: ${response.status}. Tente novamente.` };
                                logToolResult('generateImage', r);
                                return r;
                            }

                            const data = await response.json();
                            const parts = data.candidates?.[0]?.content?.parts || [];
                            console.log(`  📦 Response parts: ${parts.length} (${parts.map((p: any) => p.inlineData ? 'image' : 'text').join(', ')})`);

                            for (const part of parts) {
                                if (part.inlineData) {
                                    const ext = part.inlineData.mimeType === 'image/png' ? 'png' : 'jpg';
                                    const fileName = `zeninho_${Date.now()}.${ext}`;

                                    try {
                                        const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                                        const { error: uploadError } = await supabase.storage
                                            .from('imagensgeradas')
                                            .upload(fileName, imageBuffer, {
                                                contentType: part.inlineData.mimeType,
                                                upsert: false,
                                            });

                                        if (uploadError) {
                                            console.error('  ❌ Supabase upload error:', uploadError.message);
                                            const r = { success: true, imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, message: 'Imagem gerada (não salva no storage).' };
                                            logToolResult('generateImage', r);
                                            return r;
                                        }

                                        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                                            .from('imagensgeradas')
                                            .createSignedUrl(fileName, 60 * 60 * 24 * 365);

                                        if (signedUrlError || !signedUrlData?.signedUrl) {
                                            const r = { success: true, imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, message: 'Imagem gerada (erro ao gerar URL).' };
                                            logToolResult('generateImage', r);
                                            return r;
                                        }

                                        const r = { success: true, imageUrl: signedUrlData.signedUrl, message: 'Imagem gerada e salva com sucesso!' };
                                        logToolResult('generateImage', r);
                                        return r;
                                    } catch (uploadErr) {
                                        console.error('  ❌ Upload exception:', uploadErr);
                                        const r = { success: true, imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, message: 'Imagem gerada (falha no storage).' };
                                        logToolResult('generateImage', r);
                                        return r;
                                    }
                                }
                            }

                            const textParts = parts.filter((p: { text?: string }) => p.text);
                            if (textParts.length > 0) {
                                console.log('  ⚠️  Only text returned:', textParts[0].text?.slice(0, 100));
                            }
                            const r = { success: false, message: 'A API retornou texto em vez de imagem.' };
                            logToolResult('generateImage', r);
                            return r;
                        } catch (err) {
                            console.error('  ❌ generateImage exception:', err);
                            const r = { success: false, message: 'Erro ao gerar a imagem.' };
                            logToolResult('generateImage', r);
                            return r;
                        }
                    },
                }),
            },
            stopWhen: stepCountIs(10),
            onFinish({ usage, steps }) {
                logFinish(usage, steps?.length ?? stepCount, Date.now() - t0);
            },
            onError({ error }) {
                console.error('\n  ❌ ZENINHO STREAM ERROR:', error);
                console.log(sep('═') + '\n');
            },
        });

        return result.toUIMessageStreamResponse({
            sendSources: true,
        });
    } catch (error) {
        console.error('\n  ❌ ZENINHO API ERROR:', error);
        console.log(sep('═') + '\n');
        return new Response(
            JSON.stringify({ error: 'Erro interno do Zeninho. Tente novamente.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
