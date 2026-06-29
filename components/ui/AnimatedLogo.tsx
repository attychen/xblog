'use client';
import { useEffect, useState } from "react";

const FRAMES = [
  // Frame 1 - circle
  <svg key="f1" viewBox="0 0 32 32" className="w-6 h-6">
    <circle cx="16" cy="16" r="12" fill="none" stroke="url(#grad)" strokeWidth="2.5">
      <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite"/>
    </circle>
    <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a855f7"/></linearGradient></defs>
  </svg>,
  // Frame 2 - pulse ring
  <svg key="f2" viewBox="0 0 32 32" className="w-6 h-6">
    <circle cx="16" cy="16" r="8" fill="#7c3aed" opacity="0.8">
      <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="16" cy="16" r="14" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.5">
      <animate attributeName="r" values="12;15;12" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite"/>
    </circle>
  </svg>,
  // Frame 3 - wave dots
  <svg key="f3" viewBox="0 0 32 32" className="w-6 h-6">
    {[0,1,2,3,4].map(i => (
      <circle key={i} cx={6 + i * 5} cy="16" r="2.5" fill="#7c3aed">
        <animate attributeName="cy" values="16;10;16" dur="1.2s" begin={`${i * 0.15}s`} repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" begin={`${i * 0.15}s`} repeatCount="indefinite"/>
      </circle>
    ))}
  </svg>,
];

export default function AnimatedLogo() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % FRAMES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="transition-all duration-500 ease-in-out">
      {FRAMES[frame]}
    </div>
  );
}