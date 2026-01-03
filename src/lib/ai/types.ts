/**
 * AI Provider Abstraction Layer
 * Allows easy switching between different LLM providers
 */

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  /**
   * Generate an explanation for a question and its answer
   */
  generateExplanation(
    questionContent: string,
    correctAnswer: string,
    codeSnippet?: string
  ): Promise<string>;

  /**
   * Raw chat completion for more flexible use cases
   */
  chatCompletion(messages: AIMessage[]): Promise<string>;
}

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
