
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface HeroScrollProps {
  children: React.ReactNode;
  imageUrl: string;
}

export const HeroScroll: React.FC<HeroScrollProps> = ({ children, imageUrl }) => {
  const [scrollY, setScrollY] = useState(0);
  const featureRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1.2); 
  const [size, setSize] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (featureRef.current) {
        const initialSize = zoom * featureRef.current.offsetWidth;
        setSize(initialSize);
    }
  }, [zoom]);


  const newSize = size - scrollY / 3;
  const blur = scrollY / 100;
  const opacity = 1 - (scrollY / 800) * 1.3;

  const featureStyle = {
    '--bg-image': `url(${imageUrl})`,
    backgroundSize: `${newSize}px`,
    filter: `blur(${blur}px)`,
    opacity: opacity,
  } as React.CSSProperties;

  const contentStyle = {
    opacity: Math.min(1, scrollY / 300),
  };

  return (
    <div className="relative">
      <div 
        ref={featureRef}
        className="feature-bg fixed top-0 left-0 w-full h-screen bg-cover bg-center -z-10"
        style={featureStyle}
      />
      <div className="relative z-10">
        {children}
      </div>
      <div 
        className="absolute top-full w-full bg-background transition-opacity duration-300" 
        style={contentStyle}
      >
        <div className="h-screen"></div>
      </div>
    </div>
  );
};
