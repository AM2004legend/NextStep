
'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  step?: number;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ icon, title, description, children, step, className }) => (
    <div className={cn("flex gap-6 md:gap-8", className)}>
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">{icon}</div>
        <div className="flex-grow w-px bg-border my-4"></div>
      </div>
      <div className="flex-1 pb-12">
        {step && <p className="text-sm font-semibold text-primary mb-1">STEP {step}</p>}
        <h2 className="text-3xl font-bold tracking-tight mb-2 font-headline">{title}</h2>
        <div className="text-muted-foreground mb-6 max-w-2xl">{description}</div>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );

    