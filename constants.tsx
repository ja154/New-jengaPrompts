
import React from 'react';
import { PromptTemplate, Modality, Category } from './types';

export const MODALITIES: { value: Modality; label: string; icon: string }[] = [
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'image', label: 'Image', icon: '🎨' },
  { value: 'video', label: 'Video', icon: '🎬' },
  { value: 'audio', label: 'Audio', icon: '🔊' },
  { value: 'code', label: 'Code', icon: '💻' },
];

export const TEMPLATES: PromptTemplate[] = [
  {
    id: 't1',
    title: 'Cyberpunk Cityscape',
    description: 'Neon-drenched alleyways with rainy reflections.',
    category: Category.Surreal,
    modality: 'image',
    seed: 'A futuristic Tokyo alleyway at night',
    tags: ['Neon', 'Cyberpunk', 'Environment'],
    parameters: {
      Style: 'Cinematic Hyper-realistic',
      Lighting: 'Neon Blue and Hot Pink',
      Framing: 'Wide Angle',
      'Aspect Ratio': '16:9'
    }
  },
  {
    id: 't2',
    title: 'Python Data Refactor',
    description: 'Optimization for large scale data processing.',
    category: Category.Tech,
    modality: 'code',
    seed: 'Refactor this list comprehension to be more efficient',
    tags: ['Optimization', 'Data', 'Clean Code'],
    parameters: {
      Language: 'Python',
      Task: 'Optimization',
      Context: 'High-performance computing'
    }
  },
  {
    id: 't3',
    title: 'Emotional Voiceover',
    description: 'Melancholic yet hopeful narrative script.',
    category: Category.Lifestyle,
    modality: 'audio',
    seed: 'A story about a lost sailor finding home',
    tags: ['Narrative', 'Emotional', 'Voice'],
    parameters: {
      Vibe: 'Bittersweet',
      Tempo: 'Slow',
      Voice: 'Deep Male'
    }
  },
  {
    id: 't4',
    title: 'Minimalist Branding',
    description: 'Clean logo concept for a luxury brand.',
    category: Category.Business,
    modality: 'image',
    seed: 'A geometric monogram for a jewelry company',
    tags: ['Minimalist', 'Branding', 'Vector'],
    parameters: {
      Style: 'Minimalist Vector',
      Colors: 'Gold and Charcoal',
      'Negative Space': 'High'
    }
  },
  {
    id: 't5',
    title: 'Cinematic Drone Shot',
    description: 'Sweeping mountain ranges at dawn.',
    category: Category.Creative,
    modality: 'video',
    seed: 'The Alps during golden hour',
    tags: ['Aerial', 'Nature', 'Cinematic'],
    parameters: {
      POV: 'Aerial Drone',
      Movement: 'Slow Tracking',
      Resolution: '4K',
      Duration: '10s'
    }
  },
  {
    id: 't6',
    title: 'Corporate Copywriting',
    description: 'High-converting SaaS landing page text.',
    category: Category.Business,
    modality: 'text',
    seed: 'Write a headline and CTA for a productivity tool',
    tags: ['SaaS', 'Copywriting', 'Conversion'],
    parameters: {
      Tone: 'Professional',
      Goal: 'Conversion',
      Target: 'B2B Managers'
    }
  }
];

export const MODALITY_SPECIFIC_CONTROLS: Record<Modality, { name: string; options: string[] }[]> = {
  text: [
    { name: 'Tone', options: ['Professional', 'Humorous', 'Empathetic', 'Authoritative', 'Poetic'] },
    { name: 'Format', options: ['Markdown', 'JSON', 'Plain Text', 'Bulleted List'] },
    { name: 'Length', options: ['Concise', 'Detailed', 'Standard'] }
  ],
  image: [
    { name: 'Style', options: ['Photorealistic', 'Digital Art', 'Oil Painting', 'Low Poly', 'Anime'] },
    { name: 'Lighting', options: ['Golden Hour', 'Volumetric', 'Studio', 'Moonlight', 'Hard Shadows'] },
    { name: 'Camera', options: ['Wide Angle', 'Macro', 'Bird\'s Eye View', 'Fisheye'] },
    { name: 'Resolution', options: ['Standard', 'High Detail', '8K'] }
  ],
  video: [
    { name: 'POV', options: ['First Person', 'Third Person', 'Cinematic Wide', 'Handheld'] },
    { name: 'Movement', options: ['Static', 'Panning', 'Dolly Zoom', 'Tracking'] },
    { name: 'Duration', options: ['5s', '10s', '30s'] }
  ],
  audio: [
    { name: 'Vibe', options: ['Epic', 'Ambient', 'Lofi', 'Industrial', 'Cinematic'] },
    { name: 'Pacing', options: ['Fast-paced', 'Rhythmic', 'Slow-burn'] },
    { name: 'Genre', options: ['Synthwave', 'Classical', 'Acoustic'] }
  ],
  code: [
    { name: 'Language', options: ['TypeScript', 'Python', 'Rust', 'Go', 'SQL'] },
    { name: 'Task', options: ['Refactor', 'Debug', 'Document', 'Explain', 'Unit Test'] },
    { name: 'Style', options: ['Functional', 'OOP', 'Clean Code Principles'] }
  ]
};
