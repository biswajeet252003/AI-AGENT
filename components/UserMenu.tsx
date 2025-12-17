import React, { useState } from 'react';
import { User as UserIcon, Settings, CreditCard, LogOut, X, Shield, Key, Sparkles } from 'lucide-react';
import { User } from '../types';

interface UserMenuProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

type Tab = 'profile' | 'settings' | 'billing';

const UserMenu: React.FC<UserMenuProps> = ({ user, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Helper to open Google AI Studio for key management
  const handleManageKeys = () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      (window as any).aistudio.openSelectKey();
    } else {
      window.open('https://aistudio.google.com/app/apikey', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-zinc-950/50 border-b md:border-b-0 md:border-r border-zinc-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-white truncate">{user.name}</div>
                <div className="text-xs text-zinc-500 truncate">{user.email}</div>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'profile', icon: UserIcon, label: 'My Account' },
                { id: 'settings', icon: Settings, label: 'Preferences' },
                { id: 'billing', icon: CreditCard, label: 'Plan & Billing' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-4"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto relative bg-zinc-900">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>

          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Details</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase">Full Name</label>
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 text-sm">
                      {user.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase">Email Address</label>
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 text-sm">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800">
                  <h3 className="text-sm font-medium text-white mb-4">Security</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">
                    <Shield size={14} />
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-semibold text-white mb-6">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                   <div>
                     <div className="text-sm font-medium text-white">Stream Responses</div>
                     <div className="text-xs text-zinc-500">See the message as it's being typed</div>
                   </div>
                   <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                   </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                   <div>
                     <div className="text-sm font-medium text-white">Sound Effects</div>
                     <div className="text-xs text-zinc-500">Play sounds for messages</div>
                   </div>
                   <div className="w-10 h-6 bg-zinc-700 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-semibold text-white mb-1">Plan & Billing</h2>
              <p className="text-zinc-500 text-sm mb-6">Manage your API keys and usage.</p>

              <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-xl mb-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Sparkles size={100} />
                 </div>
                 <div className="relative z-10">
                   <div className="inline-flex items-center gap-2 px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase rounded mb-3">
                     Free Tier
                   </div>
                   <h3 className="text-lg font-medium text-white">Nox Personal</h3>
                   <p className="text-zinc-400 text-sm mt-1">Standard rate limits apply.</p>
                 </div>
              </div>

              <h3 className="text-sm font-medium text-white mb-3">API Configuration</h3>
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400">
                    <Key size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-200">Google Gemini API Key</div>
                    <div className="text-xs text-zinc-500">Used for Veo and Paid Models</div>
                  </div>
                </div>
                <button 
                  onClick={handleManageKeys}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white rounded-lg transition-colors"
                >
                  Manage Key
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserMenu;