import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Play,
  AlertTriangle,
  CloudLightning,
} from 'lucide-react';
import { soundSynthesizer } from '../utils/audioAlert';

interface HeaderProps {
  onOpenOptimization?: () => void;
  onOpenDisruption?: () => void;
  bannerMessage?: string | null;
  onNavigateToWeather?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenOptimization,
  onOpenDisruption,
  bannerMessage,
  onNavigateToWeather,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(soundSynthesizer.getMuted());
  const [showBanner, setShowBanner] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
          '  ' +
          now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }) +
          ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const newMuted = soundSynthesizer.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) {
      soundSynthesizer.playNoticeChime();
    }
  };

  const activeBanner =
    bannerMessage !== undefined
      ? bannerMessage
      : 'Severe Thunderstorm detected in Zone B. Take necessary action and review affected missions.';

  return (
    <header className="h-18 px-6 bg-[#EAF2FC] border-b border-[#C2D5ED]/70 flex items-center justify-between z-20 shrink-0 shadow-xs">
      {/* Brand Identity / Left */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-[#EAF2FC] rounded-2xl flex items-center justify-center">
            {/* Eagle/Wing Crest */}
            <svg
              className="w-6 h-6 text-[#4285F4]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L1 9l4 2 7-4 7 4 4-2-11-7zm0 6L4 12l8 4 8-4-8-4zm0 6l-6 3 6 3 6-3-6-3z" />
            </svg>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-[#14264A]">AIR OPS</h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#4285F4] border border-blue-200">
              SIH26250
            </span>
          </div>
          <p className="text-[11px] text-[#607391] font-medium leading-none">
            AI-Powered Air Operations & Resource Optimisation
          </p>
        </div>
      </div>

      {/* Center High Weather Alert Banner (Exact Match to Mockup) */}
      {showBanner && activeBanner && (
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full bg-[#FDE8E8] border border-[#F04452]/40 shadow-sm animate-fade-in max-w-xl mx-4">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white shadow-xs text-[#F04452] text-[11px] font-black tracking-wide shrink-0">
            <CloudLightning className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>HIGH WEATHER ALERT</span>
          </div>
          <span
            onClick={onNavigateToWeather}
            className="text-xs font-semibold text-[#991B1B] truncate cursor-pointer hover:underline"
          >
            {activeBanner}
          </span>
          <button
            onClick={() => setShowBanner(false)}
            className="text-[#F04452] hover:text-[#991B1B] text-xs font-bold px-1.5 py-0.5 rounded-full hover:bg-white/60 transition cursor-pointer shrink-0"
            title="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-3">
        {/* Live UTC Clock & System Status */}
        <div className="hidden sm:flex flex-col text-right">
          <div className="text-xs font-mono font-bold text-[#14264A]">{timeStr}</div>
          <div className="text-[11px] text-[#25C98A] font-semibold flex items-center justify-end gap-1">
            <span className="w-2 h-2 rounded-full bg-[#25C98A] animate-pulse"></span>
            <span>System Online</span>
          </div>
        </div>

        {/* Audio Synthesizer Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSound}
            className="clay-btn p-2 text-[#14264A] hover:text-[#4285F4] transition cursor-pointer"
            title={isMuted ? 'Audio Alerts Muted (Click to Unmute)' : 'Audio Alerts Active (Click to Mute)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#F04452]" /> : <Volume2 className="w-4 h-4 text-[#4285F4]" />}
          </button>
          <button
            onClick={() => soundSynthesizer.testSound()}
            className="clay-btn hidden md:inline-flex px-2.5 py-1.5 text-[11px] font-bold text-[#607391] hover:text-[#4285F4] transition cursor-pointer"
            title="Preview Audio Chime"
          >
            Chime
          </button>
        </div>

        {/* Tactical Shortcut Buttons */}
        {onOpenOptimization && (
          <button
            onClick={onOpenOptimization}
            className="hidden xl:inline-flex items-center gap-1.5 clay-btn-primary px-3 py-1.5 text-xs font-bold cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            Plan
          </button>
        )}

        {onOpenDisruption && (
          <button
            onClick={onOpenDisruption}
            className="hidden xl:inline-flex items-center gap-1.5 clay-btn px-3 py-1.5 text-xs font-bold text-[#F04452] hover:text-[#991B1B] cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3" />
            Disruption
          </button>
        )}

        {/* Notifications Alert Bell */}
        <div className="relative">
          <button
            onClick={onNavigateToWeather}
            className="clay-btn p-2 text-[#14264A] transition relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F04452] text-[10px] font-bold text-white shadow-xs">
              3
            </span>
          </button>
        </div>

        {/* Command Officer Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#C2D5ED]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#2563EB] flex items-center justify-center font-extrabold text-xs text-white shadow-sm">
            CO
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-[#14264A] leading-tight">Command Officer</div>
            <div className="text-[10px] text-[#607391] font-mono font-medium">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
