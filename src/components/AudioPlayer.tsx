import React, { useEffect, useRef, useState } from 'react';
import { Soundtrack } from '../types';
import { Volume2, VolumeX, Music, ShieldAlert } from 'lucide-react';

export const SOUNDTRACKS: Soundtrack[] = [
  {
    id: 'adventure',
    name: 'Epic Adventure',
    category: 'Epic Adventure',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    volume: 0.15
  },
  {
    id: 'emotional',
    name: 'Emotional Piano Chords',
    category: 'Emotional Piano',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    volume: 0.25
  },
  {
    id: 'travel',
    name: 'Wanderlust Acoustic Beat',
    category: 'Travel Vibes',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    volume: 0.2
  },
  {
    id: 'spiritual',
    name: 'Zen Temple Chimes',
    category: 'Spiritual',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    volume: 0.3
  },
  {
    id: 'orchestra',
    name: 'Cinematic Symphony',
    category: 'Cinematic Orchestra',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    volume: 0.15
  }
];

interface AudioPlayerProps {
  category: string;
  isNarrationSpeaking: boolean;
  isPlaying: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  category,
  isNarrationSpeaking,
  isPlaying
}) => {
  const [currentTrack, setCurrentTrack] = useState<Soundtrack>(SOUNDTRACKS[0]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync category select
  useEffect(() => {
    const selected = SOUNDTRACKS.find(
      (s) => s.category.toLowerCase() === category.toLowerCase() || s.id === category.toLowerCase()
    ) || SOUNDTRACKS[0];
    setCurrentTrack(selected);
  }, [category]);

  // Adjust playback state on track / isPlaying trigger
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      setErrorStatus(null);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio autoplay blocked by browser policy. Awaiting user interaction.", err);
          setErrorStatus("Interaction required to hear soundtrack");
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  // Implement Audio Ducking
  // Drop soundtrack volume by 70% when a narration block is active
  useEffect(() => {
    if (!audioRef.current) return;
    const baseVal = isMuted ? 0 : currentTrack.volume;
    
    if (isNarrationSpeaking) {
      // Duck volume (drop by ~70%)
      audioRef.current.volume = baseVal * 0.25;
    } else {
      // Restore normal volume
      audioRef.current.volume = baseVal;
    }
  }, [isNarrationSpeaking, isMuted, currentTrack]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.volume = nextMute ? 0 : currentTrack.volume * (isNarrationSpeaking ? 0.25 : 1);
  };

  return (
    <div className="flex items-center gap-4 bg-zinc-950/80 border border-zinc-800 px-4 py-2.5 rounded-full backdrop-blur-md">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        loop
        crossOrigin="anonymous"
      />

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gold animate-ping" />
        <Music className="w-4 h-4 text-gold" />
        <span className="text-xs font-mono font-medium tracking-wide text-zinc-300">
          Soundtrack: <span className="text-gold">{currentTrack.name}</span>
        </span>
      </div>

      <div className="h-4 w-px bg-zinc-800" />

      {errorStatus ? (
        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-sans">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          {errorStatus}
        </span>
      ) : (
        <span className="text-[10px] text-zinc-400 font-sans tracking-tight">
          {isNarrationSpeaking ? "🔊 (Ducked under voice)" : "🔊 Cinematic Beat Active"}
        </span>
      )}

      <button
        onClick={toggleMute}
        type="button"
        className="w-8 h-8 rounded-full border border-zinc-700/60 flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-zinc-400 cursor-pointer"
        title={isMuted ? "Unmute" : "Mute Background Music"}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
