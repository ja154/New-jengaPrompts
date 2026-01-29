
import { GoogleGenAI } from "@google/genai";
import { Modality, WorkspaceState } from "./types";

const MODEL_NAME = 'gemini-flash-latest';

export const enhancePrompt = async (
  state: WorkspaceState,
  onChunk: (chunk: string) => void
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    You are a master Prompt Engineer specializing in multi-modal generative AI.
    Your task is to take a "Seed" idea and a set of "Parameters" to build a "Master Prompt".
    
    Guidelines:
    - For Image/Video: Focus on technical details like lighting, framing, lens types, and specific artistic styles.
    - For Code: Ensure the context is technical, specifying constraints, libraries, and design patterns.
    - For Audio: Focus on texture, instrumentation, vibe, and acoustic properties.
    - For Text: Focus on tone, target audience, and structural requirements.
    
    Output Format:
    Return ONLY the final optimized prompt. Do not include introductory text or explanations.
    If the modality is 'image' or 'video', structure it for Midjourney/Sora style syntax.
    If 'code', provide a clear instruction set.
  `;

  const parametersString = Object.entries(state.params)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const prompt = `
    Modality: ${state.modality.toUpperCase()}
    Seed Idea: ${state.seed}
    Technical Parameters: ${parametersString}
    
    Generate an optimized master prompt.
  `;

  try {
    const stream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: state.isThinking ? { thinkingBudget: 24576 } : { thinkingBudget: 0 },
        temperature: 0.8,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) onChunk(text);
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    onChunk("\n\n[Error: Failed to connect to the Jenga Engine. Check your network or API key.]");
  }
};
