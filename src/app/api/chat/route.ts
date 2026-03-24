import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, UIMessage, tool, stepCountIs } from 'ai';
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

export async function POST(req: Request) {
    try {
        const { messages }: { messages: UIMessage[] } = await req.json();

        const result = streamText({
            model: google('gemini-3-flash-preview'),
            system: ZENINHO_SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages),
            tools: {
                searchDocuments: tool({
                    description: 'Busca documentos relevantes na base de conhecimento da TECHSUS. Use quando o usuário perguntar sobre documentos, processos, especificações técnicas ou qualquer informação que possa estar nos documentos da empresa.',
                    inputSchema: z.object({
                        query: z.string().describe('A consulta de busca para encontrar documentos relevantes'),
                    }),
                    execute: async ({ query }) => {
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
                                return { results: [] as string[], message: 'Não consegui buscar nos documentos no momento.' };
                            }

                            const embeddingData = await embeddingResponse.json();
                            const queryEmbedding = embeddingData.embedding?.values;

                            if (!queryEmbedding) {
                                return { results: [] as string[], message: 'Não consegui processar a busca.' };
                            }

                            const { data, error } = await supabase.rpc('match_documents', {
                                query_embedding: queryEmbedding,
                                match_threshold: 0.5,
                                match_count: 5,
                            });

                            if (error || !data || data.length === 0) {
                                return { results: [] as string[], message: 'Nenhum documento relevante encontrado.' };
                            }

                            return {
                                results: data.map((doc: { content: string; similarity: number }) => ({
                                    content: doc.content,
                                    similarity: doc.similarity,
                                })),
                                message: `Encontrei ${data.length} trecho(s) relevante(s).`,
                            };
                        } catch {
                            return { results: [] as string[], message: 'Erro ao buscar documentos.' };
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
                                return { documents: [] as string[], message: 'Nenhum documento encontrado.' };
                            }

                            return {
                                documents: data.map((doc: { title: string; created_at: string }) => ({
                                    title: doc.title,
                                    uploadedAt: doc.created_at,
                                })),
                                message: `${data.length} documento(s) na base de conhecimento.`,
                            };
                        } catch {
                            return { documents: [] as string[], message: 'Erro ao listar documentos.' };
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
                        try {
                            console.log('[generateImage] Tool called with prompt:', prompt.substring(0, 80));
                            console.log('[generateImage] Aspect ratio:', aspectRatio);

                            const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
                            if (!apiKey) {
                                console.error('[generateImage] No API key found!');
                                return { success: false, message: 'Chave de API não configurada.' };
                            }

                            const requestBody = {
                                contents: [
                                    {
                                        parts: [{ text: prompt }],
                                    },
                                ],
                                generationConfig: {
                                    responseModalities: ['Image', 'Text'],
                                },
                            };

                            console.log('[generateImage] Calling Gemini API...');
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
                                console.error('[generateImage] API error:', response.status, errText);
                                return { success: false, message: `Erro na API: ${response.status}. Tente novamente.` };
                            }

                            const data = await response.json();
                            console.log('[generateImage] Response received, parts count:', data.candidates?.[0]?.content?.parts?.length || 0);

                            const parts = data.candidates?.[0]?.content?.parts || [];

                            for (const part of parts) {
                                if (part.inlineData) {
                                    console.log('[generateImage] ✅ Image generated! MIME:', part.inlineData.mimeType, 'Size:', part.inlineData.data?.length || 0);

                                    // Upload to Supabase storage bucket
                                    const ext = part.inlineData.mimeType === 'image/png' ? 'png' : 'jpg';
                                    const fileName = `zeninho_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

                                    try {
                                        const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                                        const { error: uploadError } = await supabase.storage
                                            .from('imagensgeradas')
                                            .upload(fileName, imageBuffer, {
                                                contentType: part.inlineData.mimeType,
                                                upsert: false,
                                            });

                                        if (uploadError) {
                                            console.error('[generateImage] Supabase upload error:', uploadError.message);
                                            // Fall back to base64 if upload fails
                                            return {
                                                success: true,
                                                imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                                                message: 'Imagem gerada (mas não salva no storage).',
                                            };
                                        }

                                        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                                            .from('imagensgeradas')
                                            .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

                                        if (signedUrlError || !signedUrlData?.signedUrl) {
                                            console.error('[generateImage] Signed URL error:', signedUrlError?.message);
                                            return {
                                                success: true,
                                                imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                                                message: 'Imagem gerada (erro ao gerar URL).',
                                            };
                                        }

                                        console.log('[generateImage] ✅ Uploaded to Supabase:', signedUrlData.signedUrl.substring(0, 100));

                                        return {
                                            success: true,
                                            imageUrl: signedUrlData.signedUrl,
                                            message: 'Imagem gerada e salva com sucesso!',
                                        };
                                    } catch (uploadErr) {
                                        console.error('[generateImage] Upload failed, using base64 fallback:', uploadErr);
                                        return {
                                            success: true,
                                            imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                                            message: 'Imagem gerada (falha ao salvar no storage).',
                                        };
                                    }
                                }
                            }

                            // If only text was returned, log it
                            const textParts = parts.filter((p: { text?: string }) => p.text);
                            if (textParts.length > 0) {
                                console.log('[generateImage] ⚠️ Only text returned, no image:', textParts[0].text?.substring(0, 100));
                            }

                            return { success: false, message: 'A API retornou texto em vez de imagem. Tente com um prompt diferente.' };
                        } catch (err) {
                            console.error('[generateImage] Error:', err);
                            return { success: false, message: 'Erro ao gerar a imagem.' };
                        }
                    },
                }),
            },
            stopWhen: stepCountIs(10),
            onError({ error }) {
                console.error('Zeninho stream error:', error);
            },
        });

        return result.toUIMessageStreamResponse({
            sendSources: true,
        });
    } catch (error) {
        console.error('Zeninho API error:', error);
        return new Response(
            JSON.stringify({ error: 'Erro interno do Zeninho. Tente novamente.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
