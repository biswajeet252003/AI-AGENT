import React from 'react';
import { Message, Role } from '../types';
import { User, AlertCircle, Globe, Link, Sparkles, MapPin } from 'lucide-react';
import MarkdownMessage from './MarkdownMessage';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Search Sources
  const sources = message.groundingChunks
    ?.filter(chunk => chunk.web?.uri && chunk.web?.title)
    .map(chunk => chunk.web!);
    
  // Map Sources
  const mapSources = message.groundingChunks
    ?.filter(chunk => chunk.maps)
    .map(chunk => chunk.maps!);

  return (
    <div className={`w-full flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] lg:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
           <div className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${
            isUser ? 'bg-zinc-800 border-zinc-700' : 'bg-indigo-600 border-indigo-500'
          }`}>
            {isUser ? <User size={16} className="text-zinc-400" /> : <Sparkles size={16} className="text-white" />}
          </div>
        </div>

        {/* Message Bubble */}
        <div className={`
          relative px-5 py-3.5 shadow-lg border overflow-hidden transition-all
          ${isUser 
            ? 'bg-indigo-600/90 text-white rounded-2xl rounded-tr-sm border-indigo-500/50' 
            : 'bg-zinc-800/90 text-zinc-100 rounded-2xl rounded-tl-sm border-zinc-700/50'
          }
        `}>
          {!isUser && (
            <div className="text-[10px] font-bold text-indigo-300 mb-1.5 uppercase tracking-widest opacity-80">Nox</div>
          )}

          <div className={`prose prose-invert max-w-none text-sm md:text-base leading-relaxed ${isUser ? 'text-white' : 'text-zinc-200'}`}>
            {message.isError ? (
              <div className="flex items-center gap-2 text-red-300 bg-red-900/20 p-2 rounded-lg">
                <AlertCircle size={16} /> <span>{message.content}</span>
              </div>
            ) : (
              <>
                {/* Media Attachments/Generations */}
                {message.image && (
                  <div className="mb-3">
                    <img src={message.image} alt="Visual" className="rounded-lg border border-white/10 shadow-sm max-h-[300px] w-auto object-cover bg-black/20" />
                  </div>
                )}
                {message.video && (
                  <div className="mb-3">
                    <video controls src={message.video} className="rounded-lg border border-white/10 shadow-sm max-h-[300px] w-full bg-black/20" />
                  </div>
                )}
                {message.audio && (
                  <div className="mb-3">
                    <audio controls src={message.audio} className="w-full" />
                  </div>
                )}
                
                {/* Text Content */}
                {message.content && <MarkdownMessage content={message.content} />}
              </>
            )}
            
            {message.isStreaming && !message.isError && (
              <span className="inline-block w-1.5 h-4 align-middle bg-current animate-pulse ml-1 opacity-70"></span>
            )}
          </div>

          {/* Sources Section (Search) */}
          {sources && sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-[10px] font-semibold opacity-60 mb-2 uppercase tracking-wider">
                <Globe size={10} /> Sources
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, idx) => (
                  <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs border max-w-full ${isUser ? 'bg-indigo-700/50 border-indigo-500/30' : 'bg-zinc-900/50 border-zinc-700'}`}>
                    <Link size={10} className="opacity-70" />
                    <span className="truncate max-w-[150px] opacity-90">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

           {/* Maps Section */}
           {mapSources && mapSources.length > 0 && (
             <div className="mt-3 pt-3 border-t border-white/10">
               <div className="flex items-center gap-2 text-[10px] font-semibold opacity-60 mb-2 uppercase tracking-wider">
                 <MapPin size={10} /> Locations
               </div>
               <div className="flex flex-col gap-2">
                 {mapSources.map((map, idx) => (
                   <a key={idx} href={map.googleMapsUri} target="_blank" rel="noopener noreferrer"
                     className="flex flex-col p-2 rounded-md bg-zinc-900/50 border border-zinc-700 hover:bg-zinc-800">
                     <span className="font-semibold text-xs text-zinc-200">{map.title}</span>
                     <span className="text-[10px] text-zinc-400">{map.formattedAddress}</span>
                     <div className="flex gap-1 mt-1">
                        <span className="text-[10px] text-amber-400">★ {map.rating}</span>
                        <span className="text-[10px] text-zinc-500">({map.userRatingCount})</span>
                     </div>
                   </a>
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
