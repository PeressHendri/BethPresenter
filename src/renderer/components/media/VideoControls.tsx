import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Repeat, Volume2, VolumeX } from 'lucide-react';

interface VideoState {
  currentTime: number;
  duration: number;
  paused: boolean;
}

export function VideoControls() {
  const [videoState, setVideoState] = useState<VideoState | null>(null);
  const [isLooping, setIsLooping] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Hook to global IPC state broadcasted by Output
  useEffect(() => {
    const ipc = (window as any).electron?.ipcRenderer;
    if (!ipc) return;

    const unsubs: Array<() => void> = [];

    unsubs.push(
      ipc.on('media:video-progress', (state: VideoState) => {
        setVideoState(state);
      })
    );

    return () => unsubs.forEach((fn) => fn());
  }, []);

  const sendCommand = (cmd: string, arg?: boolean) => {
    const ipc = (window as any).electron?.ipcRenderer;
    if (ipc) {
      ipc.invoke(cmd, arg).catch(console.error);
    }
  };

  const handleTogglePlay = () => {
    if (videoState?.paused) sendCommand('output:video:play');
    else sendCommand('output:video:pause');
  };

  const handleStop = () => sendCommand('output:video:stop');
  
  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    sendCommand('output:video:setLoop', next);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sendCommand('output:video:setMuted', next);
  };

  function formatTime(s: number): string {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  // Auto Hide when duration drops to zero / unmounted on output
  if (!videoState || videoState.duration <= 0) return null;

  return (
    <div className="w-full bg-surface-sidebar border border-border-default rounded-xl p-3 flex flex-col gap-2 mt-2">
      <div className="flex items-center justify-between gap-4">
        
        {/* Playback Actions */}
        <div className="flex gap-1.5 items-center">
          <button 
            onClick={handleTogglePlay}
            className="w-8 h-8 rounded-full bg-accent-600 hover:bg-accent-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-accent-500/20"
          >
            {videoState.paused ? <Play size={14} className="ml-0.5" /> : <Pause size={14} />}
          </button>
          
          <button 
             onClick={handleStop}
             className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-surface-hover text-text-300 hover:text-danger-400 border border-border-default flex items-center justify-center transition-colors"
          >
             <Square size={12} className="fill-current" />
          </button>
        </div>

        {/* Video Scrubber */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[10px] text-text-400 font-mono tracking-wider">
            {formatTime(videoState.currentTime)}
          </span>
          <div className="flex-1 h-1.5 bg-border-strong rounded-full overflow-hidden relative">
             <div 
               className="h-full bg-accent-500 transition-all duration-300 ease-linear"
               style={{ width: `${(videoState.currentTime / videoState.duration) * 100}%` }}
             />
          </div>
          <span className="text-[10px] text-text-400 font-mono tracking-wider">
            {formatTime(videoState.duration)}
          </span>
        </div>

        {/* Option Toggles */}
        <div className="flex gap-1 items-center border-l border-border-default pl-2">
           <button 
             onClick={handleToggleLoop}
             className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${isLooping ? 'text-accent-400 bg-accent-400/10' : 'text-text-400 hover:text-text-200'}`}
             title="Toggle Loop"
           >
             <Repeat size={14} />
           </button>
           <button 
             onClick={handleToggleMute}
             className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${isMuted ? 'text-red-400 bg-red-400/10' : 'text-text-400 hover:text-text-200'}`}
             title={isMuted ? "Unmute" : "Mute"}
           >
             {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
           </button>
        </div>

      </div>
    </div>
  );
}
