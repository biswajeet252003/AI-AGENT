import React, { useState } from 'react';
import { Mic, Camera, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react';

interface PermissionScreenProps {
  onGranted: () => void;
  onSkip: () => void;
}

const PermissionScreen: React.FC<PermissionScreenProps> = ({ onGranted, onSkip }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{title: string, message: string, isBlock: boolean} | null>(null);
  
  // Selection state (Default both true, allowing user choice)
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const handleRequest = async () => {
    // If user unchecks both, treat as skipping
    if (!micEnabled && !cameraEnabled) {
      onSkip();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const constraints: MediaStreamConstraints = {};
      if (micEnabled) constraints.audio = true;
      if (cameraEnabled) constraints.video = true;

      // Request only selected permissions
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop tracks immediately as we just needed the permission grant
      stream.getTracks().forEach(track => track.stop());
      
      onGranted();
    } catch (err: any) {
      console.error("Permission error:", err);
      
      let errorData = {
        title: "Connection Failed",
        message: "Unable to access devices. Please check your system settings.",
        isBlock: false
      };

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorData = {
          title: "Access Denied",
          message: "Your browser has blocked access. Please click the lock icon 🔒 in your address bar to reset permissions.",
          isBlock: true
        };
      } else if (err.name === 'NotFoundError') {
        errorData = {
            title: "Device Not Found",
            message: "We couldn't find the requested microphone or camera.",
            isBlock: false
        };
      }
      
      setError(errorData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 p-6 animate-in fade-in duration-500">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        
        {/* Header Icon */}
        <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-1 ring-white/10 group relative transition-all duration-300">
           <div className={`absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl transition-opacity duration-300 ${micEnabled || cameraEnabled ? 'opacity-50' : 'opacity-0'}`}></div>
           {error ? (
              <AlertTriangle size={32} className="text-amber-500 animate-pulse" />
           ) : (
             <div className="relative flex gap-1">
               <Mic size={28} className={`transition-all duration-300 ${micEnabled ? 'text-indigo-400 scale-100' : 'text-zinc-700 scale-90'}`} />
               <Camera size={28} className={`transition-all duration-300 ${cameraEnabled ? 'text-purple-400 scale-100' : 'text-zinc-700 scale-90'}`} />
             </div>
           )}
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
            {error ? error.title : 'Customize Access'}
        </h2>
        
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
           {error 
             ? error.message
             : "Choose which features you want to enable. You can change these anytime in settings."
           }
        </p>

        {/* Toggles (Only show if no error to reduce clutter) */}
        {!error && (
            <div className="w-full space-y-3 mb-8">
            {/* Mic Toggle */}
            <div 
                onClick={() => setMicEnabled(!micEnabled)}
                className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all duration-200 group ${micEnabled ? 'bg-zinc-900 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-zinc-950/30 border-zinc-800 opacity-70 hover:opacity-100'}`}
            >
                <div className={`p-2 rounded-lg transition-colors ${micEnabled ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-800 text-zinc-600'}`}>
                    <Mic size={18} />
                </div>
                <div className="text-left flex-1">
                    <div className={`font-semibold text-sm transition-colors ${micEnabled ? 'text-zinc-200' : 'text-zinc-500'}`}>Voice Interaction</div>
                    <div className="text-[11px] text-zinc-500">Enable real-time voice chat</div>
                </div>
                
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 border ${micEnabled ? 'bg-indigo-600 border-indigo-600' : 'bg-zinc-800 border-zinc-600 group-hover:border-zinc-500'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${micEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
            </div>

            {/* Camera Toggle */}
            <div 
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all duration-200 group ${cameraEnabled ? 'bg-zinc-900 border-purple-500/30 ring-1 ring-purple-500/20' : 'bg-zinc-950/30 border-zinc-800 opacity-70 hover:opacity-100'}`}
            >
                <div className={`p-2 rounded-lg transition-colors ${cameraEnabled ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-800 text-zinc-600'}`}>
                    <Camera size={18} />
                </div>
                <div className="text-left flex-1">
                    <div className={`font-semibold text-sm transition-colors ${cameraEnabled ? 'text-zinc-200' : 'text-zinc-500'}`}>Visual Analysis</div>
                    <div className="text-[11px] text-zinc-500">Allow video input for analysis</div>
                </div>

                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 border ${cameraEnabled ? 'bg-purple-600 border-purple-600' : 'bg-zinc-800 border-zinc-600 group-hover:border-zinc-500'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${cameraEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
            </div>
            </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-3">
            <button
            onClick={handleRequest}
            disabled={isLoading}
            className={`w-full py-3.5 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2
                ${(!micEnabled && !cameraEnabled) && !error
                ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700' 
                : 'bg-white hover:bg-zinc-200 text-black shadow-white/5'}
            `}
            >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <>
                {error ? "Try Again" : ((!micEnabled && !cameraEnabled) ? "Skip Permissions" : "Continue")} 
                {error ? <RefreshCw size={16} /> : <ChevronRight size={16} />}
                </>
            )}
            </button>
            
            {(error || (!micEnabled && !cameraEnabled) || (!isLoading)) && (
                <button
                    onClick={onSkip}
                    className="w-full py-2 px-4 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    {error ? "Continue without access" : "Maybe later"}
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default PermissionScreen;