import { GoogleGenAI, Chat, GenerateContentResponse, Content, Modality } from "@google/genai";
import { ModelId } from "../types";
import { INITIAL_SYSTEM_INSTRUCTION } from "../constants";

let aiInstance: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI => {
  // Always create a new instance to ensure fresh API key if changed (e.g. via Paid Key selection)
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const createChatSession = (model: ModelId, history?: Content[]): Chat => {
  const ai = getAiInstance();
  
  const tools: any[] = [];
  let config: any = {
    systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
  };

  // Configure Tools and Special Models
  if (model === ModelId.FLASH) {
    tools.push({ googleSearch: {} });
    tools.push({ googleMaps: {} });
  }

  if (model === ModelId.PRO) {
    // Thinking Config
    config.thinkingConfig = { thinkingBudget: 32768 };
    // No maxOutputTokens for thinking models
  }

  if (model === ModelId.IMAGE_GEN_FAST || model === ModelId.IMAGE_GEN_PRO || model === ModelId.VIDEO_GEN) {
     config.systemInstruction = undefined; // Gen models often don't take system instructions same way
  }

  return ai.chats.create({
    model: model,
    config: {
      ...config,
      tools: tools.length > 0 ? tools : undefined,
    },
    history: history,
  });
};

// --- TTS ---
export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAiInstance();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  return base64Audio;
};

// --- Veo Video Generation ---
export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
  const ai = getAiInstance();
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      aspectRatio: aspectRatio,
      resolution: '1080p',
    }
  });

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");
  
  // Append API key for playback
  return `${videoUri}&key=${process.env.API_KEY}`;
};

// --- Live API Connect ---
export const connectLiveSession = async (
  onAudioData: (base64: string) => void,
  onClose: () => void
) => {
  const ai = getAiInstance();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => console.log('Live session opened'),
      onmessage: (msg) => {
        const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audio) onAudioData(audio);
        if (msg.serverContent?.interrupted) console.log('Interrupted');
      },
      onclose: () => {
        console.log('Live session closed');
        onClose();
      },
      onerror: (e) => console.error('Live session error', e),
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
    }
  });
};

// --- Chat Stream ---
export const sendMessageStream = async function* (
  chat: Chat,
  message: string,
  modelId: ModelId,
  attachment?: { mimeType: string; data: string },
  imageGenConfig?: { width?: string } // Optional config for Image Gen
): AsyncIterable<GenerateContentResponse> {
  const ai = getAiInstance();

  try {
    // 1. Image Gen (Fast / Edit)
    if (modelId === ModelId.IMAGE_GEN_FAST) {
      let contents: any = { parts: [] };
      if (attachment) {
        contents.parts.push({ inlineData: { mimeType: attachment.mimeType, data: attachment.data } });
      }
      contents.parts.push({ text: message });

      const result = await ai.models.generateContent({
        model: modelId,
        contents: contents,
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      yield result;
      return;
    }

    // 2. Image Gen (Pro / HQ)
    if (modelId === ModelId.IMAGE_GEN_PRO) {
      // Note: This model usually requires generateImages for Imagen, but gemini-3-pro-image-preview uses generateContent
      // Size mapping: 1K default.
      const result = await ai.models.generateContent({
        model: modelId,
        contents: { parts: [{ text: message }] },
        config: { 
          imageConfig: { imageSize: "1K" } // Defaulting to 1K for simplicity, could pass via config
        }
      });
      yield result;
      return;
    }
    
    // 3. Audio Transcription (Helper)
    // If attachment is audio, we use Flash to transcribe it implicitly by sending it
    // The model will treat it as input and respond.
    
    // 4. Standard Chat
    let messageParam: any = message;

    if (attachment) {
      // For standard chat models (Flash, Pro), send image/audio/video + text
      messageParam = [
        { 
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data
          }
        },
        { text: message }
      ];
    }

    const responseStream = await chat.sendMessageStream({ message: messageParam });
    for await (const chunk of responseStream) {
       yield chunk;
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};