import React, { useState, useRef, useEffect } from 'react';
import { ASSETS } from '../constants';

const MusicControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt auto-play on mount (often blocked by browser until interaction)
    const playPromise = audioRef.current?.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.log("Autoplay blocked, waiting for user interaction");
        setIsPlaying(false);
      });
    }
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <audio ref={audioRef} src={ASSETS.BG_MUSIC} loop />
      <button 
        onClick={toggleMusic}
        className={`absolute top-4 right-4 z-50 p-3 rounded-full border border-white/30 backdrop-blur-sm transition-all duration-700 ${isPlaying ? 'bg-yellow-500/80 rotate-180 scale-110' : 'bg-black/20'}`}
      >
        <div className={`w-6 h-6 relative flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
           {/* Cassette Icon or Music Note */}
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isPlaying ? "white" : "#ddd"} className="w-full h-full">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
           </svg>
        </div>
        {/* Visual equalizer bars simulation */}
        {isPlaying && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
             <div className="w-0.5 h-2 bg-white animate-pulse" style={{animationDelay: '0s'}}></div>
             <div className="w-0.5 h-3 bg-white animate-pulse" style={{animationDelay: '0.1s'}}></div>
             <div className="w-0.5 h-2 bg-white animate-pulse" style={{animationDelay: '0.2s'}}></div>
          </div>
        )}
      </button>
    </>
  );
};

export default MusicControl;