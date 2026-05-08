interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

function extractGeminiText(payload: GeminiResponse): string {
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) {
    throw new Error("Gemini response did not include text content.");
  }
  return text;
}

export class GeminiClient {
  public async generateJson(input: {
    apiKey: string;
    model: string;
    systemInstruction?: string;
    parts: GeminiPart[];
    responseJsonSchema: unknown;
    maxOutputTokens?: number;
  }) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": input.apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...(input.systemInstruction
            ? {
                systemInstruction: {
                  parts: [{ text: input.systemInstruction }]
                }
              }
            : {}),
          contents: [
            {
              role: "user",
              parts: input.parts.map((part) =>
                part.text
                  ? { text: part.text }
                  : {
                      inline_data: {
                        mime_type: part.inlineData?.mimeType,
                        data: part.inlineData?.data
                      }
                    }
              )
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: input.responseJsonSchema,
            temperature: 0.1,
            maxOutputTokens: input.maxOutputTokens ?? 900
          }
        })
      }
    );

    const payload = (await response.json()) as GeminiResponse;
    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message ?? `Gemini request failed with status ${response.status}.`);
    }

    return JSON.parse(extractGeminiText(payload)) as unknown;
  }
}
