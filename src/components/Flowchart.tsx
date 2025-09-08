
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface Milestone {
  label: string;
  title: string;
  tasks?: string[];
}

interface FlowchartProps {
  milestones: Milestone[];
  title: string;
  description: string;
}

const quarterColors = [
  "bg-primary/5",
  "bg-accent/80",
  "bg-secondary",
  "bg-muted",
];

export const Flowchart: React.FC<FlowchartProps> = ({ milestones, title, description }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex flex-col items-center w-full">
              <div 
                className={cn(
                  "w-full rounded-lg flex flex-col justify-start items-center p-6 shadow-md border",
                  quarterColors[index % quarterColors.length]
                )}
              >
                <div className="font-bold text-lg mb-2 text-foreground">{milestone.label}</div>
                <div className="font-semibold text-base mb-4 text-center break-words text-foreground/90">{milestone.title}</div>
                {milestone.tasks && (
                  <ul className="list-disc pl-5 space-y-2 text-left text-sm text-muted-foreground self-start w-full">
                    {milestone.tasks.map((task, i) => (
                      <li key={i} className="whitespace-normal break-words">{task}</li>
                    ))}
                  </ul>
                )}
              </div>

              {index < milestones.length - 1 && (
                <ChevronDown className="w-8 h-8 text-muted-foreground my-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
