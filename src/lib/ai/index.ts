import { AIProvider } from "./types";
import { ZhipuAIProvider } from "./zhipu";

export type AIProviderType = "zhipu" | "openai" | "anthropic";

/**
 * Factory function to get the active AI provider
 * Can be extended to support multiple providers based on env config
 */
export function getAIProvider(providerType?: AIProviderType): AIProvider {
  const type =
    providerType || (process.env.AI_PROVIDER as AIProviderType) || "zhipu";

  switch (type) {
    case "zhipu":
      return new ZhipuAIProvider();
    // Future providers can be added here:
    // case "openai":
    //   return new OpenAIProvider();
    // case "anthropic":
    //   return new AnthropicProvider();
    default:
      return new ZhipuAIProvider();
  }
}

export * from "./types";
export { ZhipuAIProvider } from "./zhipu";
