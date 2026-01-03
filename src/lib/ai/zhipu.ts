import { AIProvider, AIMessage, AIProviderConfig } from "./types";

const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const DEFAULT_MODEL = "glm-4-flash";

export class ZhipuAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config?: Partial<AIProviderConfig>) {
    this.apiKey = config?.apiKey || process.env.ZHIPUAI_API_KEY || "";
    this.model = config?.model || DEFAULT_MODEL;
    this.temperature = config?.temperature ?? 0.7;
    this.maxTokens = config?.maxTokens ?? 1024;

    if (!this.apiKey) {
      console.warn("ZhipuAI API key not configured");
    }
  }

  async chatCompletion(messages: AIMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error("ZhipuAI API key not configured");
    }

    const response = await fetch(ZHIPU_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ZhipuAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }

  async generateExplanation(
    questionContent: string,
    correctAnswer: string,
    codeSnippet?: string
  ): Promise<string> {
    const systemPrompt = `You are an expert tutor helping students understand exam questions. 
Provide clear, concise explanations in the same language as the question.
Focus on:
1. Why the correct answer is right
2. Common misconceptions
3. Key concepts to remember

Keep explanations under 300 words.`;

    let userPrompt = `Question: ${questionContent}\n\nCorrect Answer: ${correctAnswer}`;

    if (codeSnippet) {
      userPrompt += `\n\nCode:\n\`\`\`\n${codeSnippet}\n\`\`\``;
    }

    userPrompt +=
      "\n\nPlease explain this question and why the answer is correct.";

    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return this.chatCompletion(messages);
  }
}
