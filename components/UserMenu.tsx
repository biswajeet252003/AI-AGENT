import React, { useState } from 'react';
import { User as UserIcon, Settings, CreditCard, LogOut, X, Shield, Key, Sparkles, Camera, Mail, Calendar, Hash, CheckCircle2, Bell, Moon, Volume2, Globe } from 'lucide-react';
import { User } from '../types';

interface UserMenuProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

type Tab = 'profile' | 'settings' | 'billing';

const UserMenu: React.FC<UserMenuProps> = ({ user, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  // Helper to open Google AI Studio for key management
  const handleManageKeys = () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      (window as any).aistudio.openSelectKey();
    } else {
      window.open('https://aistudio.google.com/app/apikey', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[650px] relative"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Close Button (Mobile) */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors md:hidden backdrop-blur-md">
          <X size={20} />
        </button>

        {/* Sidebar */}
        <div className="w-full md:w-72 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col shrink-0">
          <div className="p-6 pb-2">
             <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Menu</h2>
             <nav className="space-y-1">
              {[
                { id: 'profile', icon: UserIcon, label: 'Profile' },
                { id: 'settings', icon: Settings, label: 'Settings' },
                { id: 'billing', icon: CreditCard, label: 'Billing & Plans' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id ? 'text-indigo-400' : 'text-zinc-500'} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-zinc-800">
             <div className="flex items-center gap-3 mb-4 px-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-zinc-900">
                  {getInitials(user.name)}
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-white truncate text-sm">{user.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-400/10 transition-colors"
              >
                <LogOut size={16} />
                Log Out
              </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* Close Button (Desktop) */}
          <button onClick={onClose} className="absolute top-6 right-6 z-50 text-zinc-500 hover:text-white hover:bg-zinc-900 p-2 rounded-full transition-all hidden md:block">
            <X size={24} />
          </button>

          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Cover Image */}
              <div className="h-48 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-zinc-900 relative">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
              </div>

              <div className="px-8 md:px-12 pb-12 -mt-16 relative">
                 {/* Header Profile */}
                 <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                    <div className="relative group">
                       <div className="w-32 h-32 rounded-3xl bg-zinc-900 border-4 border-zinc-950 shadow-2xl overflow-hidden flex items-center justify-center relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-4xl font-bold text-white">
                             {getInitials(user.name)}
                          </div>
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                             <Camera className="text-white" size={24} />
                          </div>
                       </div>
                       <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-zinc-950 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={14} className="text-black" strokeWidth={3} />
                       </div>
                    </div>
                    
                    <div className="flex-1 mb-2">
                       <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                       <div className="flex items-center gap-3 text-sm text-zinc-400">
                          <span className="flex items-center gap-1.5"><Shield size={14} className="text-indigo-400"/> Pro Member</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                          <span>UTC-05:00</span>
                       </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                       <button className="flex-1 md:flex-none px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors text-sm">
                          Edit Profile
                       </button>
                    </div>
                 </div>

                 {/* Grid Layout */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Personal Info */}
                    <div className="lg:col-span-2 space-y-8">
                       <section>
                          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                             <UserIcon size={18} className="text-indigo-400"/> Personal Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                   <UserIcon size={12}/> Full Name
                                </label>
                                <div className="text-zinc-200 font-medium">{user.name}</div>
                             </div>
                             <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                   <Mail size={12}/> Email Address
                                </label>
                                <div className="text-zinc-200 font-medium">{user.email}</div>
                             </div>
                             <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                   <Hash size={12}/> User ID
                                </label>
                                <div className="text-zinc-400 font-mono text-xs">{user.id}</div>
                             </div>
                             <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                   <Calendar size={12}/> Joined
                                </label>
                                <div className="text-zinc-200 font-medium">{new Date().toLocaleDateString()}</div>
                             </div>
                          </div>
                       </section>
                    </div>

                    {/* Right Column: Stats & Security */}
                    <div className="space-y-6">
                       <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                             <Sparkles size={80} />
                          </div>
                          <h4 className="font-semibold text-indigo-100 mb-1">Nox Pro</h4>
                          <p className="text-xs text-indigo-300/80 mb-4">You have access to all premium features.</p>
                          <div className="w-full bg-zinc-900/50 rounded-full h-1.5 mb-2 overflow-hidden">
                             <div className="bg-indigo-500 h-full rounded-full" style={{width: '75%'}}></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-400">
                             <span>Credits Used</span>
                             <span>75%</span>
                          </div>
                       </div>

                       <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                          <h4 className="font-medium text-white mb-4 text-sm">Security</h4>
                          <button className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all text-sm text-zinc-300 mb-2">
                             <span className="flex items-center gap-2"><Key size={14}/> Password</span>
                             <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded border border-zinc-700">Update</span>
                          </button>
                          <button className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all text-sm text-zinc-300">
                             <span className="flex items-center gap-2"><Shield size={14}/> 2FA</span>
                             <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">Enabled</span>
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
             <div className="max-w-3xl mx-auto px-8 py-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
                <p className="text-zinc-400 text-sm mb-8">Manage your application preferences and defaults.</p>
                
                <div className="space-y-6">
                   {/* General */}
                   <section className="space-y-4">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">General</h3>
                      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
                         <div className="p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400"><Globe size={18}/></div>
                               <div>
                                  <div className="text-sm font-medium text-zinc-200">Language</div>
                                  <div className="text-xs text-zinc-500">English (United States)</div>
                               </div>
                            </div>
                            <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-400/10 transition-colors">Edit</button>
                         </div>
                         <div className="p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400"><Moon size={18}/></div>
                               <div>
                                  <div className="text-sm font-medium text-zinc-200">Theme</div>
                                  <div className="text-xs text-zinc-500">Dark Mode</div>
                               </div>
                            </div>
                            <div className="flex items-center gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                               <button className="px-3 py-1 bg-zinc-800 rounded text-xs text-white shadow-sm">Dark</button>
                               <button className="px-3 py-1 text-xs text-zinc-500 hover:text-zinc-300">Light</button>
                            </div>
                         </div>
                      </div>
                   </section>

                   {/* Notifications */}
                   <section className="space-y-4 pt-4">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Notifications</h3>
                      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
                         <div className="p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400"><Volume2 size={18}/></div>
                               <div>
                                  <div className="text-sm font-medium text-zinc-200">Sound Effects</div>
                                  <div className="text-xs text-zinc-500">Play sounds for incoming messages</div>
                               </div>
                            </div>
                             <div className="w-11 h-6 bg-zinc-700 rounded-full relative cursor-pointer border border-transparent transition-colors hover:border-zinc-600">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                             </div>
                         </div>
                         <div className="p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400"><Bell size={18}/></div>
                               <div>
                                  <div className="text-sm font-medium text-zinc-200">Email Notifications</div>
                                  <div className="text-xs text-zinc-500">Receive weekly updates</div>
                               </div>
                            </div>
                            <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-pointer border border-transparent">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                             </div>
                         </div>
                      </div>
                   </section>
                </div>
             </div>
          )}

          {activeTab === 'billing' && (
             <div className="max-w-3xl mx-auto px-8 py-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-bold text-white mb-2">Plan & Billing</h2>
              <p className="text-zinc-400 text-sm mb-8">Manage your API keys and subscription.</p>

              {/* Card */}
              <div className="p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl mb-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                    <Sparkles size={180} className="text-white" strokeWidth={1}/>
                 </div>
                 <div className="relative z-10">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider rounded-full mb-4">
                     Current Plan
                   </div>
                   <h3 className="text-3xl font-bold text-white mb-2">Nox Personal</h3>
                   <p className="text-zinc-300 text-sm max-w-md mb-8">You are currently on the free tier. Upgrade to unlock Veo Video generation and higher rate limits.</p>
                   
                   <div className="flex gap-4">
                      <button className="px-5 py-2.5 bg-white text-indigo-950 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20">
                         Upgrade Plan
                      </button>
                      <button className="px-5 py-2.5 bg-indigo-950/50 text-white font-medium text-sm rounded-xl border border-indigo-500/30 hover:bg-indigo-900/50 transition-colors">
                         View Invoices
                      </button>
                   </div>
                 </div>
              </div>

              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">API Configuration</h3>
              <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-950 rounded-xl text-zinc-400 border border-zinc-800 group-hover:border-zinc-700 group-hover:text-indigo-400 transition-all">
                    <Key size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">Google Gemini API Key</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Required for premium models like Veo</div>
                  </div>
                </div>
                <button 
                  onClick={handleManageKeys}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white rounded-xl transition-colors border border-zinc-700"
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