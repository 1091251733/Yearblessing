
import React, { useEffect, useState } from 'react';
import { Particle } from '../types';

const ParticleBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Increased count for denser rain
    const count = 60;
    const newParticles: Particle[] = [];
    // Pure Gold palette for "Golden Dots"
    const colors = ['#FFD700', '#FDB931', '#FFFACD', '#DAA520', '#F0E68C']; 

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // Random horizontal position
        size: Math.random() * 6 + 4, // Smaller size for dots (4-10px)
        duration: Math.random() * 5 + 8, // Fall duration (8-13s)
        delay: Math.random() * -15, // Negative delay to start mid-air immediately
        opacity: Math.random() * 0.5 + 0.5,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size}px`, // Equal width/height for circle
            backgroundColor: p.color,
            borderRadius: '50%', // Circle shape
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
