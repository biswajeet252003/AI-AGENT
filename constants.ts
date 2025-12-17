import { ModelId } from './types';

export const DEFAULT_MODEL = ModelId.FLASH;

export const MODEL_OPTIONS = [
  { id: ModelId.FLASH, name: 'Nox Flash', description: 'Search, Maps & Speed' },
  { id: ModelId.LITE, name: 'Nox Lite', description: 'Ultra Fast' },
  { id: ModelId.PRO, name: 'Nox Pro', description: 'Thinking & Analysis' },
  { id: ModelId.IMAGE_GEN_FAST, name: 'Nox Canvas', description: 'Edit & Gen Images' },
  { id: ModelId.IMAGE_GEN_PRO, name: 'Nox Studio', description: 'HQ Images (Paid)' },
  { id: ModelId.VIDEO_GEN, name: 'Nox Cinema', description: 'Veo Video (Paid)' },
];

export const INITIAL_SYSTEM_INSTRUCTION = `
You are Nox, a witty, empathetic, and highly knowledgeable AI assistant. 
Your tone is professional yet conversational.

When using Google Search or Maps, explicitly mention you are looking up information.
If the user asks for a video or high-quality image, guide them to use the appropriate model if they haven't.
`.trim();
