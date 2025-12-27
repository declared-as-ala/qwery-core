import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

type ModelProvider = {
  resolveModel: (modelName: string) => LanguageModel;
};

export type LocalLLMModelProviderOptions = {
  baseUrl?: string;
  apiKey?: string;
  defaultModel?: string;
};

/**
 * Creates a local LLM provider that connects to an OpenAI-compatible API
 * running locally (e.g., vLLM, llama.cpp server, text-generation-webui, etc.)
 *
 * The local LLM server should be running and accessible at the baseUrl.
 * Default baseUrl is http://localhost:8000/v1 (common for vLLM and similar servers)
 */
export function createLocalLLMModelProvider({
  baseUrl = 'http://localhost:8000/v1',
  apiKey = 'not-needed', // Most local servers don't require auth, but OpenAI SDK requires a key
  defaultModel,
}: LocalLLMModelProviderOptions = {}): ModelProvider {
  // Create OpenAI-compatible client pointing to local server
  const openai = createOpenAI({
    baseURL: baseUrl,
    apiKey: apiKey,
  });

  return {
    resolveModel: (modelName) => {
      const finalModel = modelName || defaultModel;
      if (!finalModel) {
        throw new Error(
          "[AgentFactory] Missing local LLM model. Provide it as 'local-llm/<model-name>' or set LOCAL_LLM_MODEL.",
        );
      }

      try {
        return openai(finalModel);
      } catch (error) {
        throw new Error(
          `[AgentFactory] Failed to create local LLM model '${finalModel}'. ` +
            `Ensure your local LLM server is running at ${baseUrl}. ` +
            `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  };
}

