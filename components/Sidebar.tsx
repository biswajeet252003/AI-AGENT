import React, { useMemo } from 'react';
import { Plus, Trash2, X, Settings, LogOut, User as UserIcon, Sparkles, MessageSquare } from 'lucide-react';
import { ChatSession, User } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  user: User | null;
  onOpenProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession,
  isOpen,
  toggleSidebar,
  user,
  onOpenProfile
}) => {
  
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const previous7Days: ChatSession[] = [];
    const older: ChatSession[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - (86400000 * 7);

    sessions.slice().reverse().forEach(session => {
      if (session.updatedAt >= todayStart) {
        today.push(session);
      } else if (session.updatedAt >= yesterdayStart) {
        yesterday.push(session);
      } else if (session.updatedAt >= weekStart) {
        previous7Days.push(session);
      } else {
        older.push(session);
      }
    });

    return { today, yesterday, previous7Days, older };
  }, [sessions]);

  const renderSessionGroup = (title: string, groupSessions: ChatSession[]) => {
    if (groupSessions.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="px-3 text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-wider">{title}</div>
        <div className="space-y-1">
          {groupSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                onSelectSession(session.id);
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 rounded-lg cursor-pointer overflow-hidden
                ${session.id === currentSessionId 
                  ? 'bg-zinc-800 text-white shadow-sm' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}
              `}
            >
              <MessageSquare size={14} className={`shrink-0 ${session.id === currentSessionId ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
              <div className="relative z-10 flex-1 truncate pr-6 text-[13px]">
                {session.title || 'New Chat'}
              </div>
              
              <button
                onClick={(e) => onDeleteSession(e, session.id)}
                className={`
                  absolute right-2 z-20 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-700/50 opacity-0 group-hover:opacity-100 transition-all
                  ${session.id === currentSessionId ? 'opacity-100' : ''}
                `}
              >
                <Trash2 size={13} />
              </button>
              
              {session.id === currentSessionId && (
                 <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-800 to-transparent pointer-events-none z-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-[260px] bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Header / New Chat */}
        <div className="p-3 mb-1">
          <div className="flex items-center justify-between md:hidden mb-4 px-2">
             <span className="font-bold text-zinc-200">Menu</span>
             <button onClick={toggleSidebar} className="text-zinc-400"><X size={20}/></button>
          </div>

           <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) toggleSidebar();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-zinc-200 transition-colors duration-200 hover:bg-zinc-900 border border-zinc-800/50 rounded-lg group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white text-black rounded-full shadow-sm">
                 <Plus size={14} strokeWidth={3} />
              </div>
              <span className="font-medium text-[13px]">New chat</span>
            </div>
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                 <MessageSquare size={16} className="text-zinc-600"/>
              </div>
              <p className="text-sm text-zinc-500 font-medium">No history yet</p>
              <p className="text-xs text-zinc-600 mt-1">Start a conversation to see it here.</p>
            </div>
          ) : (
            <>
              {renderSessionGroup('Today', groupedSessions.today)}
              {renderSessionGroup('Yesterday', groupedSessions.yesterday)}
              {renderSessionGroup('Previous 7 Days', groupedSessions.previous7Days)}
              {renderSessionGroup('Older', groupedSessions.older)}
            </>
          )}
        </div>

        {/* Upgrade Banner (Visual Filler) */}
        <div className="px-3 pb-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 mb-3 group cursor-pointer hover:border-indigo-500/40 transition-colors">
             <div className="flex items-center gap-2 mb-1">
               <div className="p-1 bg-indigo-500 rounded-full">
                  <Sparkles size={10} className="text-white fill-white" />
               </div>
               <span className="text-xs font-bold text-white">Nox Plus</span>
             </div>
             <p className="text-[10px] text-zinc-400 leading-relaxed mb-2">
               Get access to Veo Video generation and advanced reasoning models.
             </p>
             <div className="text-[10px] font-medium text-indigo-300 group-hover:text-indigo-200">
               Upgrade plan &rarr;
             </div>
          </div>

          <div className="h-px bg-zinc-800 w-full mb-3"></div>

          {/* User Profile */}
          <div 
             onClick={onOpenProfile}
             className="flex items-center justify-between px-2 py-2 text-sm text-zinc-300 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer group"
            >
             <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-lg ring-1 ring-white/10">
                   {user ? getInitials(user.name) : <UserIcon size={14} />}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-[13px] group-hover:text-white truncate max-w-[120px]">
                    {user ? user.name : 'Guest'}
                  </span>
                </div>
             </div>
             <Settings size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
           </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;