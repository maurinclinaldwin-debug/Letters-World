import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { windAudio } from '../../utils/audio.ts';

export const WindAudioControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSound = () => {
    const active = windAudio.toggle();
    setIsPlaying(active);
  };

  return (
    <button
      id="wind-audio-toggle-button"
      onClick={toggleSound}
      aria-label={isPlaying ? 'Mute ambient mountain breeze' : 'Listen to ambient mountain breeze'}
      title={isPlaying ? 'Mute mountain breeze' : 'Listen to mountain breeze'}
      className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181a20]/40 hover:bg-[#181a20]/65 border border-[#ffffff]/10 hover:border-[#ffffff]/20 backdrop-blur-md text-[#dcd6cf] text-xs font-sans tracking-wider uppercase transition-all duration-300 pointer-events-auto"
    >
      {isPlaying ? (
        <Volume2 className="w-3.5 h-3.5 text-[#e5a894] transition-colors" />
      ) : (
        <VolumeX className="w-3.5 h-3.5 text-[#9a949e] group-hover:text-[#dcd6cf] transition-colors" />
      )}
      <span className="hidden sm:inline text-[11px] opacity-80 group-hover:opacity-100">
        {isPlaying ? 'Wind' : 'Sound'}
      </span>
    </button>
  );
};
