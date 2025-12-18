export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text passwords
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    googleMapsUri: string;
    title: string;
    formattedAddress: string;
    rating?: number;
    userRatingCount?: number;
  };
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  isError?: boolean;
  groundingChunks?: GroundingChunk[]; // Allow flexibility for Maps/Search
  image?: string; // Base64 data URI
  video?: string; // Video URI
  audio?: string; // Audio URI (Base64)
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export enum ModelId {
  FLASH = 'gemini-3-flash-preview', // Latest Flash for Basic Text
  LITE = 'gemini-flash-lite-latest', // Fast Lite
  PRO = 'gemini-3-pro-preview', // Thinking + Reasoning
  IMAGE_GEN_FAST = 'gemini-2.5-flash-image', // Image Edit / Fast Gen
  IMAGE_GEN_PRO = 'gemini-3-pro-image-preview', // HQ Gen
  VIDEO_GEN = 'veo-3.1-fast-generate-preview', // Video Gen
}