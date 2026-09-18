import React, { useRef, useState } from 'react';
import { setCursorMode } from '../hooks/useCursor';
import { soundManager } from '../audio/soundManager';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.35,
  className = '',
  onClick,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseEnter = () => {
    setCursorMode('hover');
    soundManager.playHoverTick();
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setCursorMode('default');
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: position.x === 0 ? 'transform 0.5s cubic-bezier(0.2, 1, 0.3, 1)' : 'none',
      }}
      className={`relative inline-flex items-center justify-center will-change-transform ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
