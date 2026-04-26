
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { Modality, WorkspaceState } from "./types";

const MODEL_NAME = 'gemini-3-flash-preview';
const THINKING_MODEL_NAME = 'gemini-3.1-pro-preview';
const JSON_MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Maps API errors to human-readable troubleshooting messages.
 */
const getErrorMessage = (error: any): string => {
  const message = error?.message || "";
  const status = error?.status || 0;

  if (!process.env.GEMINI_API_KEY) {
    return "API Key missing. Please ensure the workspace environment is correctly configured.";
  }

  if (message.includes("API_KEY_INVALID") || status === 401 || status === 403) {
    return "Authentication failed. The API key provided is invalid or has insufficient permissions.";
  }

  if (message.includes("quota") || status === 429) {
    return "Rate limit exceeded. The Jenga Engine is cooling down; please wait a moment before trying again.";
  }

  if (message.includes("safety") || message.includes("blocked")) {
    return "Content blocked. The request triggered safety filters. Please refine your seed idea and technical parameters.";
  }

  if (status >= 500) {
    return "Server Error. Gemini is currently experiencing high load or internal issues. Please try again later.";
  }

  return `An unexpected error occurred: ${message || "Unknown connection error"}. Please check your network and try again.`;
};

export const enhancePrompt = async (
  state: WorkspaceState,
  onChunk: (chunk: string) => void
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const systemInstruction = `
    You are an elite, world-class Prompt Engineer and LLM Architect specializing in multi-modal generative AI (Midjourney, Sora, GPT-4, Gemini, Claude, Stable Diffusion, and specialized Audio AI).
    Your task is to transform a "Seed Idea" and "Technical Parameters" into a comprehensive, high-fidelity "Master Prompt" that maximizes model performance and output quality.
    
    CORE OPERATING PRINCIPLES:
    - High Information Density: Every word must serve a purpose. Avoid fluff. Use industry-standard terminology.
    - Contextual Anchoring: Define the atmosphere, lighting, emotional tone, and technical medium explicitly.
    - Structural Precision: Organize prompts logically (e.g., [Subject], [Style], [Technical Specs], [Negative Constraints] where applicable).
    
    MODALITY-SPECIFIC DEPTH:
    - IMAGE/VIDEO: Use cinematic terminology (anamorphic, 8k, ray tracing, depth of field). Specify lens (35mm, 85mm), lighting (chiaroscuro, Rembrandt, high-key), and artist/director styles if appropriate. Use Midjourney v6 / Sora syntax: starts with the subject, followed by modifiers, and ending with parameters (e.g., --ar 16:9).
    - CODE: Focus on modularity, scalability, and security. Specify exact libraries, design patterns (Clean Architecture, SOLID), and performance constraints. Frame it as an instruction set for a Senior Lead Developer.
    - AUDIO/MUSIC: Define instrumentation, tempo, frequency response, acoustic environment (reverb, dry, studio-grade), and emotional arc. Use texture-based descriptions (grainy, lush, ethereal).
    - TEXT/WRITING: Use specific linguistic personas. Define the target audience, reading level, and specific rhethorical devices allowed. Implement "Chain of Thought" or "Step-by-Step" framing as a technical parameter if implied.
    
    OUTPUT PROTOCOL:
    - Return ONLY the final optimized Master Prompt.
    - NO introductory sentences ("Here is your prompt...").
    - NO trailing explanations.
    - If the user provides parameters, they MUST be integrated seamlessly into the prompt logic.
  `;

  const parametersString = Object.entries(state.params)
    .map(([k, v]) => `[${k.toUpperCase()}]: ${v}`)
    .join('\n');

  const prompt = `
    MODALITY: ${state.modality.toUpperCase()}
    CORE CONCEPT (SEED): ${state.seed}
    TECHNICAL CONSTRAINTS:
    ${parametersString}
    
    Construct the final Master Prompt using elite prompt engineering techniques.
  `;

  try {
    const stream = await ai.models.generateContentStream({
      model: state.isThinking ? THINKING_MODEL_NAME : MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction,
        ...(state.isThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } } : {}),
        temperature: 0.8,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) onChunk(text);
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const friendlyMessage = getErrorMessage(error);
    onChunk(`\n\n[ENGINE ERROR]\n${friendlyMessage}`);
  }
};

export const convertToJSON = async (promptText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: JSON_MODEL_NAME,
      contents: `Perform a deep structural analysis of the following AI prompt. Deconstruct it into its semantic components, ensuring the "raw_prompt" perfectly preserves the original generation while other fields provide meta-analysis.
      
      Prompt to analyze: ${promptText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            core_objective: { type: Type.STRING, description: "The primary purpose or subject of the prompt." },
            style_and_format: { type: Type.STRING, description: "The aesthetic, tone, or structural format (e.g., Midjourney syntax, Python script)." },
            technical_constraints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific technical requirements like lighting, resolution, libraries, or architecture." },
            high_level_analysis: { type: Type.STRING, description: "A one-sentence expert evaluation of why this prompt is effective." },
            raw_prompt: { type: Type.STRING, description: "The complete, verbatim prompt text." }
          },
          required: ["core_objective", "style_and_format", "raw_prompt", "technical_constraints", "high_level_analysis"]
        }
      }
    });
    return response.text || '';
  } catch (error: any) {
    console.error("JSON Conversion Error:", error);
    const friendlyMessage = getErrorMessage(error);
    return JSON.stringify({ error: "Structure conversion failed", message: friendlyMessage }, null, 2);
  }
};
