import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Play,
  AlertTriangle,
  CloudLightning,
  Menu,
} from 'lucide-react';
import { soundSynthesizer } from '../utils/audioAlert';

interface HeaderProps {
  onOpenOptimization?: () => void;
  onOpenDisruption?: () => void;
  bannerMessage?: string | null;
  onNavigateToWeather?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenOptimization,
  onOpenDisruption,
  bannerMessage,
  onNavigateToWeather,
  onToggleMobileMenu,
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
    <header className="h-16 px-3 sm:px-6 bg-[#EAF2FC] border-b border-[#C2D5ED]/70 flex items-center justify-between z-20 shrink-0 shadow-xs">
      {/* Brand Identity / Left */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden clay-btn p-2 text-[#14264A] hover:text-[#4285F4] transition cursor-pointer shrink-0"
            title="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="lg:hidden w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] p-0.5 shadow-sm flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#EAF2FC] rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 9l4 2 7-4 7 4 4-2-11-7zm0 6L4 12l8 4 8-4-8-4zm0 6l-6 3 6 3 6-3-6-3z" />
              </svg>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[#14264A] truncate">
                AIR OPS
              </h1>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-[#4285F4] border border-blue-200 shrink-0">
                SIH26250
              </span>
            </div>
            <p className="hidden xl:block text-[11px] text-[#607391] font-medium leading-none truncate">
              AI-Powered Air Operations & Resource Optimisation
            </p>
          </div>
        </div>
      </div>

      {/* Center High Weather Alert Banner (Responsive: full on 2xl, compact on lg-xl, hidden on mobile/tablet) */}
      {showBanner && activeBanner && (
        <>
          {/* Full Banner on 2xl+ */}
          <div className="hidden 2xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FDE8E8] border border-[#F04452]/40 shadow-xs animate-fade-in max-w-md mx-3 min-w-0">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white shadow-xs text-[#F04452] text-[10px] font-black tracking-wide shrink-0">
              <CloudLightning className="w-3 h-3 fill-current animate-pulse" />
              <span>WEATHER ALERT</span>
            </div>
            <span
              onClick={onNavigateToWeather}
              className="text-xs font-semibold text-[#991B1B] truncate cursor-pointer hover:underline"
              title={activeBanner}
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

          {/* Compact Chip on lg to xl */}
          <div
            onClick={onNavigateToWeather}
            className="hidden lg:flex 2xl:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDE8E8] border border-[#F04452]/40 shadow-xs text-[#991B1B] text-xs font-bold cursor-pointer hover:bg-[#FCD7D7] transition mx-2 shrink-0"
            title={activeBanner}
          >
            <CloudLightning className="w-3.5 h-3.5 text-[#F04452] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#B91C1C]">Zone B Weather Alert</span>
          </div>
        </>
      )}

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live UTC Clock & System Status */}
        <div className="hidden md:flex flex-col text-right shrink-0">
          <div className="text-xs font-mono font-bold text-[#14264A]">{timeStr}</div>
          <div className="text-[10px] text-[#25C98A] font-semibold flex items-center justify-end gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25C98A] animate-pulse"></span>
            <span>System Online</span>
          </div>
        </div>

        {/* Audio Synthesizer Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleSound}
            className="clay-btn p-2 text-[#14264A] hover:text-[#4285F4] transition cursor-pointer shrink-0"
            title={isMuted ? 'Audio Alerts Muted (Click to Unmute)' : 'Audio Alerts Active (Click to Mute)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#F04452]" /> : <Volume2 className="w-4 h-4 text-[#4285F4]" />}
          </button>
          <button
            onClick={() => soundSynthesizer.testSound()}
            className="clay-btn hidden 2xl:inline-flex px-2.5 py-1.5 text-[11px] font-bold text-[#607391] hover:text-[#4285F4] transition cursor-pointer shrink-0"
            title="Preview Audio Chime"
          >
            Chime
          </button>
        </div>

        {/* Tactical Shortcut Buttons */}
        {onOpenOptimization && (
          <button
            onClick={onOpenOptimization}
            className="hidden xl:inline-flex items-center gap-1.5 clay-btn-primary px-3 py-1.5 text-xs font-bold cursor-pointer shrink-0"
          >
            <Play className="w-3 h-3 fill-current" />
            Plan
          </button>
        )}

        {onOpenDisruption && (
          <button
            onClick={onOpenDisruption}
            className="hidden xl:inline-flex items-center gap-1.5 clay-btn px-3 py-1.5 text-xs font-bold text-[#F04452] hover:text-[#991B1B] cursor-pointer shrink-0"
          >
            <AlertTriangle className="w-3 h-3" />
            Disruption
          </button>
        )}

        {/* Notifications Alert Bell */}
        <div className="relative shrink-0">
          <button
            onClick={onNavigateToWeather}
            className="clay-btn p-2 text-[#14264A] transition relative cursor-pointer"
            title="View Weather Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F04452] text-[10px] font-bold text-white shadow-xs">
              3
            </span>
          </button>
        </div>

        {/* Command Officer Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#C2D5ED]/70 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#2563EB] flex items-center justify-center font-extrabold text-xs text-white shadow-sm shrink-0">
            CO
          </div>
          <div className="hidden xl:block text-left shrink-0">
            <div className="text-xs font-bold text-[#14264A] leading-tight">Command Officer</div>
            <div className="text-[10px] text-[#607391] font-mono font-medium">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
