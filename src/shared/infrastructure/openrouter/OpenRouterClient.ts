interface OpenRouterTextPart {
  type?: string;
  text?: string;
}

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: {
      content?: string | OpenRouterTextPart[];
    };
  }>;
  error?: {
    message?: string;
    metadata?: {
      provider_name?: string;
      raw?: unknown;
    };
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatRawError(raw: unknown) {
  if (typeof raw === "string") {
    return raw;
  }
  if (raw && typeof raw === "object") {
    try {
      return JSON.stringify(raw);
    } catch {
      return "[raw provider error]";
    }
  }
  return "";
}

function formatOpenRouterError(payload: OpenRouterChatResponse, status: number) {
  const providerName = payload.error?.metadata?.provider_name;
  const raw = formatRawError(payload.error?.metadata?.raw);
  const baseMessage = payload.error?.message ?? `OpenRouter request failed with status ${status}.`;

  if (providerName && raw) {
    return `${baseMessage} Provider: ${providerName}. Raw: ${raw}`;
  }
  if (providerName) {
    return `${baseMessage} Provider: ${providerName}.`;
  }
  return baseMessage;
}

function extractTextContent(content: string | OpenRouterTextPart[] | undefined): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((part) => (part.type === "text" ? part.text ?? "" : "")).join("");
  }
  throw new Error("OpenRouter response did not include text content.");
}

function extractJsonPayload(content: string): unknown {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch?.[1]?.trim() || trimmed;

  try {
    return JSON.parse(candidate) as unknown;
  } catch {
    const firstObject = candidate.indexOf("{");
    const lastObject = candidate.lastIndexOf("}");
    if (firstObject >= 0 && lastObject > firstObject) {
      return JSON.parse(candidate.slice(firstObject, lastObject + 1)) as unknown;
    }

    const firstArray = candidate.indexOf("[");
    const lastArray = candidate.lastIndexOf("]");
    if (firstArray >= 0 && lastArray > firstArray) {
      return JSON.parse(candidate.slice(firstArray, lastArray + 1)) as unknown;
    }

    throw new Error("OpenRouter response did not contain valid JSON.");
  }
}

export class OpenRouterClient {
  public async completeJson(input: {
    apiKey: string;
    model: string;
    messages: Array<Record<string, unknown>>;
    responseFormat?: unknown;
    requireParameters?: boolean;
    maxTokens?: number;
  }) {
    const requestBody: Record<string, unknown> = {
      model: input.model,
      messages: input.messages,
      temperature: 0.1,
      max_tokens: input.maxTokens ?? 900,
      stream: false
    };

    if (input.responseFormat) {
      requestBody.response_format = input.responseFormat;
    }
    if (input.requireParameters) {
      requestBody.provider = {
        require_parameters: true
      };
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://tradescope-ai.local",
          "X-Title": "TradeScope AI"
        },
        body: JSON.stringify(requestBody)
      });

      const payload = (await response.json()) as OpenRouterChatResponse;
      if (payload.error) {
        lastError = new Error(formatOpenRouterError(payload, response.status));
      } else if (!response.ok) {
        lastError = new Error(`OpenRouter request failed with status ${response.status}.`);
      } else {
        try {
          return extractJsonPayload(extractTextContent(payload.choices?.[0]?.message?.content));
        } catch (error) {
          lastError = error instanceof Error ? error : new Error("OpenRouter response parse failed.");
        }
      }

      const isRetryableStatus = response.status === 429 || response.status === 502 || response.status === 503;
      const isRetryableMessage =
        lastError instanceof Error &&
        /Provider returned error|OpenRouter response did not include text content|temporar|timeout|overloaded/i.test(
          lastError.message
        );

      if (attempt === 1 || (!isRetryableStatus && !isRetryableMessage)) {
        break;
      }

      const retryAfterHeader = Number(response.headers.get("Retry-After"));
      const retryDelayMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0 ? retryAfterHeader * 1000 : 800;
      await sleep(retryDelayMs);
    }

    throw lastError ?? new Error("OpenRouter request failed.");
  }
}
