
export type Modality = 'text' | 'image' | 'video' | 'audio' | 'code';

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  modality: Modality;
  seed: string;
  parameters: Record<string, string>;
}

export interface GeneratedPrompt {
  id: string;
  timestamp: number;
  originalSeed: string;
  enhancedPrompt: string;
  modality: Modality;
  isBookmarked: boolean;
}

export interface WorkspaceState {
  modality: Modality;
  seed: string;
  params: Record<string, string>;
  isThinking: boolean;
}

export enum Category {
  Surreal = 'Surreal',
  Tech = 'Tech',
  Lifestyle = 'Lifestyle',
  Business = 'Business',
  Creative = 'Creative',
  Professional = 'Professional'
}
