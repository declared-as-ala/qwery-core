# Local LLM Integration

## Overview

This document describes the integration of a local open-source LLM provider to replace Qwery Core's cloud LLM dependency (Azure OpenAI). The integration uses an OpenAI-compatible API interface, allowing the platform to work with any local LLM server that implements the OpenAI API specification.

## Local LLM Used

**Provider Type**: OpenAI-compatible local server  
**Default Endpoint**: `http://localhost:8000/v1`  
**Model Format**: `local-llm/<model-name>`

### Supported Local LLM Servers

The integration works with any OpenAI-compatible local LLM server, including:

- **vLLM**: High-performance LLM serving engine
- **llama.cpp server**: Lightweight C++ implementation
- **text-generation-webui**: Web-based interface with OpenAI-compatible API
- **LM Studio**: Desktop application with OpenAI-compatible server
- **Any other OpenAI-compatible server**

### Configuration

The local LLM provider can be configured via environment variables:

- `LOCAL_LLM_BASE_URL`: Base URL for the local LLM server (default: `http://localhost:8000/v1`)
- `LOCAL_LLM_API_KEY`: API key (default: `not-needed` - most local servers don't require auth)
- `LOCAL_LLM_MODEL`: Default model name (optional, can be specified in model string)

## How the Provider Works

### Architecture

1. **Provider Registration**: The `local-llm` provider is registered in the model resolver system alongside other providers (ollama, webllm, browser, etc.)

2. **Model Resolution**: When a model string like `local-llm/default` is requested:
   - The model resolver parses the provider ID (`local-llm`) and model name (`default`)
   - It creates a `LocalLLMModelProvider` instance with configuration from environment variables
   - The provider uses `@ai-sdk/openai` to create an OpenAI-compatible client pointing to the local server

3. **Request Flow**:
   - Qwery Core sends prompts to the local LLM via the OpenAI-compatible API
   - The local LLM server processes the request and returns completions
   - Responses are formatted and returned to Qwery Core in the expected format

4. **Error Handling**: 
   - Graceful error handling if the local LLM server is not running
   - Clear error messages indicating the server URL and connection issues
   - Fallback behavior maintains system stability

### Implementation Details

The provider implementation (`local-llm-model.provider.ts`):

- Uses `@ai-sdk/openai` with a custom `baseURL` pointing to the local server
- Implements the `ModelProvider` interface with a `resolveModel` method
- Returns `LanguageModel` instances compatible with the AI SDK
- Handles model name resolution (supports both explicit model names and defaults)

## Modified Files

### Core Provider Implementation

1. **`packages/agent-factory-sdk/src/services/models/local-llm-model.provider.ts`** (NEW)
   - Implements the local LLM provider
   - Creates OpenAI-compatible client for local server

2. **`packages/agent-factory-sdk/src/services/model-resolver.ts`**
   - Added `local-llm` case to provider switch statement
   - Removed `azure` provider case
   - Updated error message to include `local-llm` in available providers

3. **`packages/agent-factory-sdk/src/services/index.ts`**
   - Exported `local-llm-model.provider`
   - Removed Azure model provider export

4. **`packages/agent-factory-sdk/src/index.ts`**
   - Updated `SUPPORTED_MODELS` to use `local-llm/default` as default
   - Removed Azure export

5. **`packages/agent-factory-sdk/package.json`**
   - Added `@ai-sdk/openai` dependency
   - Removed `@ai-sdk/azure` dependency

### Default Model References Updated

All references to `azure/gpt-5-mini` have been replaced with `local-llm/default`:

6. **`apps/web/app/routes/api/chat.ts`**
   - Updated default model in `getOrCreateAgent` function
   - Updated default model in action handler

7. **`apps/web/app/routes/api/notebook/prompt.ts`**
   - Updated default model in `getOrCreateAgent` function
   - Updated default model in action handler

8. **`apps/web/components/agents-provider.tsx`**
   - Updated default model fallback

9. **`apps/web/app/routes/project/_components/agent-ui-wrapper.tsx`**
   - Updated default model reference

10. **`apps/cli/src/services/interactive-repl.ts`**
    - Updated default model references (2 locations)

11. **`apps/cli/src/services/notebook-runner.ts`**
    - Updated default model reference

### Agent Factory SDK Updates

12. **`packages/agent-factory-sdk/src/agents/tools/generate-chart.ts`**
    - Updated model references (2 locations)

13. **`packages/agent-factory-sdk/src/agents/actors/detect-intent.actor.ts`**
    - Updated model reference

14. **`packages/agent-factory-sdk/src/agents/actors/summarize-intent.actor.ts`**
    - Updated model reference

15. **`packages/agent-factory-sdk/src/agents/actors/system-info.actor.ts`**
    - Updated model reference

16. **`packages/agent-factory-sdk/src/services/generate-conversation-title.service.ts`**
    - Updated model reference

17. **`packages/agent-factory-sdk/src/services/generate-sheet-name.service.ts`**
    - Updated model reference

## Build Status

### Extensions Build
✅ **SUCCESS**: `pnpm extensions:build` completed successfully

### Web App Build
⚠️ **PARTIAL**: Build encountered a pre-existing issue with `@qwery/extension-clickhouse-node` package resolution. This is unrelated to the LLM integration changes and appears to be a configuration issue with the extension system.

The LLM provider code changes are syntactically correct (no linter errors) and follow the existing provider architecture pattern.

## Assumptions Made

1. **OpenAI-Compatible API**: Assumes the local LLM server implements the OpenAI API specification (chat completions endpoint at `/v1/chat/completions`)

2. **Default Port**: Uses `http://localhost:8000/v1` as the default base URL, which is common for vLLM and similar servers

3. **No Authentication**: Most local LLM servers don't require authentication, so a dummy API key (`not-needed`) is used by default

4. **Model Name Format**: Uses the format `local-llm/<model-name>` where `<model-name>` matches the model identifier expected by the local server

5. **Server Availability**: Assumes the local LLM server is running and accessible when Qwery Core makes requests. Error handling provides clear messages if the server is unavailable.

6. **Transport**: The `local-llm` provider uses the default server-side transport (not browser transport), as it requires server-side API calls to the local LLM endpoint.

## Testing

To test the integration:

1. **Start a local LLM server** (e.g., using vLLM, llama.cpp, or LM Studio)
   ```bash
   # Example with vLLM
   python -m vllm.entrypoints.openai.api_server --model <model-name> --port 8000
   ```

2. **Set environment variables** (optional, defaults work for most setups):
   ```bash
   export LOCAL_LLM_BASE_URL=http://localhost:8000/v1
   export LOCAL_LLM_MODEL=default
   ```

3. **Start Qwery Core**:
   ```bash
   pnpm dev
   ```

4. **Verify**: Send a prompt through the Qwery interface and confirm it reaches the local LLM server.

## Migration Notes

- All default model references have been changed from `azure/gpt-5-mini` to `local-llm/default`
- The Azure provider has been removed from the model resolver (but the code files remain for potential future use)
- No breaking changes to the API - the model string format remains `provider/model-name`
- Existing code using other providers (ollama, webllm, browser, etc.) continues to work unchanged

## Future Enhancements

Potential improvements:

1. **Health Check**: Add a health check endpoint to verify local LLM server availability
2. **Model Discovery**: Automatically discover available models from the local server
3. **Connection Pooling**: Optimize connections to the local LLM server
4. **Retry Logic**: Add automatic retry with exponential backoff for transient failures
5. **Metrics**: Add telemetry for local LLM request/response times and error rates

