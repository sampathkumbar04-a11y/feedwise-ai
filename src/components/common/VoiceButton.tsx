import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speechService } from '../../services/speechService';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceButtonProps {
  id?: string;
  textToRead: string;
  label?: string;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  id,
  textToRead,
  label = 'Listen',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { language } = useLanguage();

  const handleToggleSpeak = () => {
    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speechService.speak(textToRead, language as 'en' | 'hi' | 'kn');
      setTimeout(() => setIsPlaying(false), 8000);
    }
  };

  return (
    <button
      id={id}
      type="button"
      onClick={handleToggleSpeak}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 ${className}`}
      title="Listen to recommendation"
    >
      {isPlaying ? (
        <>
          <VolumeX className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
