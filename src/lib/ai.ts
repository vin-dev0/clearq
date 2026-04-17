import { createOpenAI, openai } from "@ai-sdk/openai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { createAnthropic, anthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
import { LanguageModel } from "ai";

export type AIProvider = "openai" | "google" | "anthropic" | "deepseek" | "groq";

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
}

/**
 * Get an AI model instance based on the provider and model name.
 * Uses environment variables by default, but can accept an optional API key.
 */
export function getAIModel(config: AIConfig): LanguageModel {
  const { provider, model, apiKey } = config;

  switch (provider) {
    case "google":
      if (apiKey) {
        const googleProvider = createGoogleGenerativeAI({ apiKey });
        return googleProvider(model);
      }
      return google(model);

    case "anthropic":
      if (apiKey) {
        const anthropicProvider = createAnthropic({ apiKey });
        return anthropicProvider(model);
      }
      return anthropic(model);

    case "deepseek":
      const deepseek = createOpenAI({
        name: "deepseek",
        apiKey: apiKey || process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com",
      });
      return deepseek(model);

    case "groq":
      const groqProvider = createGroq({
        apiKey: apiKey || process.env.GROQ_API_KEY,
      });
      return groqProvider(model);

    case "openai":
    default:
      if (apiKey) {
        const openaiProvider = createOpenAI({ apiKey });
        return openaiProvider(model);
      }
      return openai(model);
  }
}

/**
 * Get the default AI model based on environment variables.
 * Falls back to GPT-4o-mini if nothing is configured.
 */
export function getDefaultAIModel(): LanguageModel {
  const provider = (process.env.DEFAULT_AI_PROVIDER as AIProvider) || "openai";
  const model = process.env.DEFAULT_AI_MODEL || (provider === "openai" ? "gpt-4o-mini" : "");

  if (!model) {
    // Fallback if provider was set but model wasn't
    if (provider === "google") return google("gemini-1.5-pro");
    if (provider === "anthropic") return anthropic("claude-3-5-sonnet-20240620");
    if (provider === "deepseek") {
      const ds = createOpenAI({
        name: "deepseek",
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com",
      });
      return ds("deepseek-chat");
    }
  }

  return getAIModel({ provider, model });
}
