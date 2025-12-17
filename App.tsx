import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Menu, Sparkles, StopCircle, Zap, Command, Image as ImageIcon, Paperclip, X, Mic, Video as VideoIcon, Volume2, Radio, Clapperboard, BrainCircuit, Zap as ZapIcon, ChevronDown, Check, Globe, MapPin, Code, Monitor, Smartphone } from 'lucide-react';
import { Chat, GenerateContentResponse, Content } from "@google/genai";
import ChatMessage from './components/ChatMessage';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import UserMenu from './components/UserMenu';
import { Message, Role, ChatSession, ModelId, User } from './types';
import { createChatSession, sendMessageStream, generateVideo, generateSpeech, connectLiveSession } from './services/geminiService';
import { authService } from './services/authService';
import { MODEL_OPTIONS, DEFAULT_MODEL } from './constants';

// --- Audio Helpers ---
const base64ToBytes = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const pcmToAudioBuffer = (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): AudioBuffer => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const App: React.FC = () => {
  // Application State
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [attachment, setAttachment] = useState<{data: string, mimeType: string, preview: string} | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  // Refs
  const chatInstanceRef = useRef<Chat | null>(null);
  const chatModelRef = useRef<ModelId | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Live API Refs
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null); // For Output (24kHz)
  const inputAudioContextRef = useRef<AudioContext | null>(null); // For Input (16kHz)
  const nextStartTimeRef = useRef<number>(0);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Initialize Auth
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Initialize Chat (Only when logged in)
  const startNewChat = useCallback(() => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setAttachment(null);
    chatInstanceRef.current = createChatSession(selectedModel);
    chatModelRef.current = selectedModel;
    if (textareaRef.current) textareaRef.current.focus();
  }, [selectedModel]);

  useEffect(() => {
    if (currentUser) {
      startNewChat();
    }
  }, [currentUser]); 

  // Handle Login/Logout
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setSessions([]);
    setMessages([]);
    setShowUserMenu(false);
  };

  const checkPaidKey = async (): Promise<boolean> => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && aiStudio.hasSelectedApiKey) {
      const hasKey = await aiStudio.hasSelectedApiKey();
      if (!hasKey && aiStudio.openSelectKey) {
        aiStudio.openSelectKey();
        return false;
      }
      return true;
    }
    return true; 
  };

  const handleModelChange = (modelId: ModelId) => {
    if (modelId === selectedModel) return;
    setSelectedModel(modelId);
    setTimeout(() => startNewChat(), 10);
  };

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      setMessages(session.messages);
      setAttachment(null);
      const historyForSdk: Content[] = session.messages
        .filter(m => !m.isError && !m.video)
        .map(m => ({ role: m.role, parts: [{ text: m.content }] }));
      chatInstanceRef.current = createChatSession(selectedModel, historyForSdk); 
      chatModelRef.current = selectedModel;
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) startNewChat();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) { alert("File too large"); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && result.includes(',')) {
          const base64Data = result.split(',')[1];
          const mimeType = result.split(';')[0].split(':')[1];
          setAttachment({ data: base64Data, mimeType, preview: result });
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleLiveMode = async () => {
    if (isLiveActive) {
      liveSessionRef.current?.close();
      inputAudioContextRef.current?.close();
      audioContextRef.current?.close();
      setIsLiveActive(false);
    } else {
      try {
        // Output Context (24kHz)
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;
        nextStartTimeRef.current = outputCtx.currentTime;

        // Input Context (16kHz)
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        inputAudioContextRef.current = inputCtx;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);

        const sessionPromise = connectLiveSession(
          async (base64Audio) => {
            // Play Audio from Model
            const bytes = base64ToBytes(base64Audio);
            const buffer = pcmToAudioBuffer(bytes, outputCtx, 24000);
            
            const s = outputCtx.createBufferSource();
            s.buffer = buffer;
            s.connect(outputCtx.destination);
            
            const startTime = Math.max(outputCtx.currentTime, nextStartTimeRef.current);
            s.start(startTime);
            nextStartTimeRef.current = startTime + buffer.duration;
          },
          () => setIsLiveActive(false)
        );

        processor.onaudioprocess = (e) => {
          // Send Audio to Model
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Convert Float32 to Int16
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = inputData[i] * 32768;
          }

          // Convert to Byte String for Base64
          const uint8 = new Uint8Array(pcmData.buffer);
          let binary = '';
          const len = uint8.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8[i]);
          }
          const b64 = btoa(binary);

          sessionPromise.then(s => {
            s.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: b64 } });
          });
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
        
        const session = await sessionPromise;
        liveSessionRef.current = session;
        setIsLiveActive(true);
      } catch (e) {
        console.error("Live init failed", e);
        alert("Failed to start Live mode. Please ensure microphone permissions are allowed.");
      }
    }
  };

  const playTTS = async (text: string) => {
    try {
      const audioBase64 = await generateSpeech(text);
      // TTS output is typically 24kHz raw PCM
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const bytes = base64ToBytes(audioBase64);
      const buffer = pcmToAudioBuffer(bytes, ctx, 24000);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      console.error("TTS Playback failed:", e);
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachment) || !currentSessionId || isStreaming) return;
    if (selectedModel === ModelId.VIDEO_GEN || selectedModel === ModelId.IMAGE_GEN_PRO) {
      const allowed = await checkPaidKey();
      if (!allowed) return;
    }

    const userText = input.trim();
    const currentAttachment = attachment;
    
    setInput('');
    setAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: userText,
      timestamp: Date.now(),
      image: currentAttachment?.mimeType.startsWith('image/') ? currentAttachment.preview : undefined,
      audio: currentAttachment?.mimeType.startsWith('audio/') ? currentAttachment.preview : undefined,
      video: currentAttachment?.mimeType.startsWith('video/') ? currentAttachment.preview : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    const botMessageId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, {
      id: botMessageId,
      role: Role.MODEL,
      content: selectedModel === ModelId.VIDEO_GEN ? 'Generating video... (this may take a minute)' : '',
      timestamp: Date.now(),
      isStreaming: true
    }]);

    try {
      if (selectedModel === ModelId.VIDEO_GEN) {
        const videoUrl = await generateVideo(userText || "A video", videoAspectRatio);
        setMessages(prev => prev.map(msg => 
           msg.id === botMessageId ? { ...msg, content: `Generated video for: "${userText}"`, video: videoUrl, isStreaming: false } : msg
        ));
        setIsStreaming(false);
        return;
      }

      if (!chatInstanceRef.current || chatModelRef.current !== selectedModel) {
        chatInstanceRef.current = createChatSession(selectedModel);
        chatModelRef.current = selectedModel;
      }

      const attachmentData = currentAttachment ? { mimeType: currentAttachment.mimeType, data: currentAttachment.data } : undefined;

      const responseStream = await sendMessageStream(
        chatInstanceRef.current, 
        userText || (attachmentData ? "Analyze this" : ""), 
        selectedModel,
        attachmentData
      );
      
      let fullText = '';
      let groundingChunks: any[] = [];
      let genImageUrl: string | undefined;

      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text; 
        if (c.candidates?.[0]?.groundingMetadata?.groundingChunks) groundingChunks = c.candidates[0].groundingMetadata.groundingChunks;
        const parts = c.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData) genImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
        if (textChunk) fullText += textChunk;

        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, content: fullText, groundingChunks, image: genImageUrl } : msg
        ));
      }
      setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, isStreaming: false } : msg));
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, isStreaming: false, isError: true, content: "Error processing request." } : msg
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  const getModelConfig = (id: string) => {
    switch (id) {
      case ModelId.FLASH: return { icon: ZapIcon, color: 'text-amber-400', bg: 'from-amber-500/10 to-transparent', label: 'Flash' };
      case ModelId.LITE: return { icon: Zap, color: 'text-green-400', bg: 'from-green-500/10 to-transparent', label: 'Lite' };
      case ModelId.PRO: return { icon: BrainCircuit, color: 'text-indigo-400', bg: 'from-indigo-500/10 to-transparent', label: 'Pro' };
      case ModelId.IMAGE_GEN_PRO: return { icon: ImageIcon, color: 'text-pink-400', bg: 'from-pink-500/10 to-transparent', label: 'Studio' };
      case ModelId.VIDEO_GEN: return { icon: Clapperboard, color: 'text-purple-400', bg: 'from-purple-500/10 to-transparent', label: 'Cinema' };
      case ModelId.IMAGE_GEN_FAST: return { icon: Sparkles, color: 'text-cyan-400', bg: 'from-cyan-500/10 to-transparent', label: 'Canvas' };
      default: return { icon: Command, color: 'text-blue-400', bg: 'from-blue-500/10 to-transparent', label: 'Chat' };
    }
  };

  const getWelcomeContent = (modelId: ModelId) => {
    // Shared structure for welcome screen
    const base = {
      title: `Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, ${currentUser?.name.split(' ')[0]}`,
      subtitle: "What can I do for you?",
      suggestions: [],
      capabilities: []
    };

    switch (modelId) {
      case ModelId.VIDEO_GEN:
        return {
          ...base,
          subtitle: "Describe a scene to generate a video",
          capabilities: [{label: '1080p Generation', icon: <VideoIcon size={12}/>}, {label: 'Cinematic', icon: <Clapperboard size={12}/>}],
          suggestions: [
            { category: 'Creative', text: "A futuristic city in neon rain with flying cars" },
            { category: 'Nature', text: "Time lapse of a blooming rose in 4k" },
            { category: 'Animation', text: "A cute robot gardening on Mars" },
            { category: 'Abstract', text: "Liquid metal flowing in zero gravity" }
          ]
        };
      case ModelId.IMAGE_GEN_PRO:
        return {
          ...base,
          subtitle: "Professional Image Studio",
          capabilities: [{label: 'High Fidelity', icon: <ImageIcon size={12}/>}, {label: 'Complex Prompting', icon: <BrainCircuit size={12}/>}],
          suggestions: [
            { category: 'Design', text: "Minimalist logo for a specialty coffee shop" },
            { category: 'Art', text: "Oil painting of a cozy cabin in winter" },
            { category: 'Concept', text: "Cyberpunk street food vendor character sheet" },
            { category: 'Photography', text: "Portrait of a woman with dramatic lighting" }
          ]
        };
      case ModelId.PRO:
        return {
          ...base,
          capabilities: [{label: 'Deep Reasoning', icon: <BrainCircuit size={12}/>}, {label: 'Code Analysis', icon: <Code size={12}/>}],
          suggestions: [
            { category: 'Coding', text: "Debug this Python script for memory leaks" },
            { category: 'Writing', text: "Draft a technical proposal for cloud migration" },
            { category: 'Learning', text: "Explain quantum entanglement like I'm 5" },
            { category: 'Analysis', text: "Compare the economic policies of the last decade" }
          ]
        };
      default: // Flash/Lite
        return {
          ...base,
          capabilities: [{label: 'Web Search', icon: <Globe size={12}/>}, {label: 'Maps', icon: <MapPin size={12}/>}],
          suggestions: [
            { category: 'Search', text: "What happened in the latest F1 race?" },
            { category: 'Maps', text: "Find top-rated Italian restaurants nearby" },
            { category: 'Creative', text: "Write a short sci-fi story about time travel" },
            { category: 'Planning', text: "Create a 3-day itinerary for Tokyo" }
          ]
        };
    }
  };

  const modelConfig = getModelConfig(selectedModel);
  const welcomeContent = getWelcomeContent(selectedModel);
  const selectedModelData = MODEL_OPTIONS.find(m => m.id === selectedModel);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {showUserMenu && (
        <UserMenu 
          user={currentUser} 
          onClose={() => setShowUserMenu(false)} 
          onLogout={handleLogout} 
        />
      )}

      {isLiveActive && (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center animate-in fade-in">
           <div className="absolute top-8 right-8">
              <button onClick={toggleLiveMode} className="p-4 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-all">
                <X size={32} />
              </button>
           </div>
           <div className="w-48 h-48 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse-slow relative">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping"></div>
              <Mic size={64} className="text-indigo-400" />
           </div>
           <h2 className="mt-8 text-2xl font-light tracking-widest uppercase text-zinc-400">Nox Live</h2>
           <p className="mt-2 text-zinc-600">Listening...</p>
        </div>
      )}
      
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={startNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        user={currentUser}
        onOpenProfile={() => setShowUserMenu(true)}
      />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-zinc-950 transition-colors duration-500">
        
        {/* Dynamic Background Gradient based on Model */}
        <div className={`absolute inset-0 bg-gradient-to-b ${modelConfig.bg} opacity-20 pointer-events-none transition-all duration-700`}></div>

        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-10 flex items-center justify-between p-3 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-400"><Menu size={20} /></button>
          <span className="font-semibold text-zinc-200 flex items-center gap-2">
            <modelConfig.icon size={16} className={modelConfig.color} />
            {modelConfig.label}
          </span>
          <button onClick={startNewChat} className="p-2 text-zinc-400"><Sparkles size={18} /></button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center pt-4 pb-2 px-6 z-10 relative">
          {/* Spacer to center the model selector */}
          <div className="w-9"></div>

          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            >
              <span className="text-zinc-400">Model:</span>
              <span className="flex items-center gap-2">
                {selectedModelData?.name}
                <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isModelMenuOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {isModelMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsModelMenuOpen(false)}></div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 p-1.5">
                  {MODEL_OPTIONS.map((model) => {
                     const isActive = selectedModel === model.id;
                     const config = getModelConfig(model.id as ModelId);
                     const Icon = config.icon;
                     
                     return (
                       <button
                         key={model.id}
                         onClick={() => {
                           handleModelChange(model.id as ModelId);
                           setIsModelMenuOpen(false);
                         }}
                         className={`
                           w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all
                           ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}
                         `}
                       >
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-zinc-950 border border-zinc-800 ${isActive ? 'ring-1 ring-white/20' : ''}`}>
                           <Icon size={20} className={config.color} />
                         </div>
                         <div className="flex-1">
                           <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                             {model.name}
                           </div>
                           <div className="text-xs text-zinc-500 leading-tight mt-0.5">
                             {model.description}
                           </div>
                         </div>
                         {isActive && <Check size={16} className="text-indigo-400" />}
                       </button>
                     );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <div className="group relative">
              <div 
                onClick={() => setShowUserMenu(true)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white/10 cursor-pointer hover:scale-105 transition-transform hover:ring-2 hover:ring-indigo-500/50"
              >
                {getInitials(currentUser.name)}
              </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent z-10 relative">
          {messages.length === 0 ? (
            <div className="min-h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 pb-36 md:pb-48">
               
               {/* Hero Section */}
               <div className={`w-16 h-16 bg-zinc-900/80 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800 shadow-2xl shadow-black/50 ${modelConfig.color} ring-1 ring-white/5`}>
                 <modelConfig.icon size={32} />
               </div>
               
               <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">{welcomeContent.title}</h2>
               <p className="max-w-md text-zinc-400 mb-8 text-base">
                 {welcomeContent.subtitle}
               </p>

               {/* Capabilities Chips */}
               <div className="flex items-center gap-2 mb-8 flex-wrap justify-center">
                 {welcomeContent.capabilities.map((cap: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                      {cap.icon} {cap.label}
                    </div>
                 ))}
               </div>
               
               {/* Suggestion Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full px-2">
                 {welcomeContent.suggestions.map((item: any, i: number) => (
                   <button 
                    key={i}
                    onClick={() => { setInput(item.text); if(textareaRef.current) textareaRef.current.focus(); }}
                    className="flex flex-col text-left p-3.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/50 hover:border-zinc-700 rounded-xl transition-all hover:shadow-lg group backdrop-blur-sm"
                   >
                     <span className={`text-[10px] font-bold uppercase mb-1 opacity-60 group-hover:opacity-100 transition-opacity ${modelConfig.color}`}>
                       {item.category}
                     </span>
                     <span className="text-sm text-zinc-300 font-medium leading-relaxed group-hover:text-white">{item.text}</span>
                   </button>
                 ))}
               </div>

               {/* Footer Info */}
               <div className="absolute bottom-6 left-0 w-full text-center pointer-events-none">
                 <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-semibold">Powered by Google Gemini</p>
               </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full px-4 pt-6 pb-4">
              {messages.map((msg) => (
                <div key={msg.id} className="relative group">
                  <ChatMessage message={msg} />
                  {msg.role === Role.MODEL && !msg.isStreaming && (
                    <button 
                      onClick={() => playTTS(msg.content)}
                      className="absolute left-14 -bottom-0 p-1.5 text-zinc-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Read aloud"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} className="h-48 md:h-64 flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-20 pb-6 px-4 z-20 pointer-events-none">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-2 pointer-events-auto">
            
            {isStreaming && (
               <div className="flex justify-center">
                 <button className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-full border border-zinc-700 text-xs font-medium shadow-lg hover:bg-zinc-700 transition-colors">
                   <StopCircle size={14} /> Stop Generating
                 </button>
               </div>
            )}
            
            {/* Aspect Ratio Selector for Video */}
            {selectedModel === ModelId.VIDEO_GEN && (
               <div className="flex justify-end pr-2 mb-1 animate-fade-in-up">
                 <div className="flex items-center gap-1 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-lg p-0.5 shadow-lg">
                    <button 
                      onClick={() => setVideoAspectRatio('16:9')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${videoAspectRatio === '16:9' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Monitor size={12} /> 16:9
                    </button>
                    <button 
                      onClick={() => setVideoAspectRatio('9:16')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${videoAspectRatio === '9:16' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Smartphone size={12} /> 9:16
                    </button>
                 </div>
               </div>
            )}

            {attachment && (
              <div className="flex items-center gap-3 p-2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl w-fit animate-fade-in-up mx-2 mb-1 shadow-xl">
                 <div className="relative group shrink-0">
                      {attachment.mimeType.startsWith('image/') ? (
                        <img src={attachment.preview} alt="Att" className="h-14 w-14 rounded-xl object-cover border border-zinc-700" />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                           {attachment.mimeType.startsWith('video/') ? <VideoIcon size={20} className="text-zinc-400"/> : <Volume2 size={20} className="text-zinc-400"/>}
                        </div>
                      )}
                      <button 
                        onClick={() => setAttachment(null)}
                        className="absolute -top-1.5 -right-1.5 bg-zinc-800 text-white rounded-full p-0.5 border border-zinc-700 shadow-md"
                      >
                        <X size={12} />
                      </button>
                 </div>
                 <div className="text-xs text-zinc-400 pr-3 min-w-[100px]">
                    <span className="block font-medium text-zinc-200">Attached</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-70">
                        {attachment.mimeType.split('/')[1] || 'FILE'}
                    </span>
                 </div>
              </div>
            )}

            <div className={`relative flex items-end gap-2 p-2 bg-zinc-900/80 backdrop-blur-xl rounded-[26px] border border-zinc-800 shadow-2xl focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700/50 transition-all duration-300 ${input || attachment ? 'scale-100' : 'scale-[0.99]'}`}>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*,audio/*" />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-colors"
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>

              <button
                onClick={toggleLiveMode}
                className={`flex-shrink-0 p-3 rounded-full transition-colors ${isLiveActive ? 'text-red-400 bg-red-400/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                title="Live Mode"
              >
                {isLiveActive ? <Radio size={20} className="animate-pulse"/> : <Mic size={20} />}
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                placeholder={attachment ? "Describe this..." : `Message ${modelConfig.label}...`}
                className="flex-1 max-h-[200px] bg-transparent border-0 focus:ring-0 text-zinc-100 placeholder-zinc-500 resize-none py-3 px-1"
                rows={1}
                disabled={isStreaming}
              />

              <button
                onClick={handleSendMessage}
                disabled={(!input.trim() && !attachment) || isStreaming}
                className={`
                  flex-shrink-0 p-2.5 rounded-full mb-0.5 mr-0.5 transition-all
                  ${(!input.trim() && !attachment) || isStreaming 
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-zinc-200 shadow-md transform hover:scale-105'}
                `}
              >
                <Send size={18} fill={(!input.trim() && !attachment) ? "none" : "currentColor"} />
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-[10px] text-zinc-600 font-medium">
                Nox can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;