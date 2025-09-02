'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

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

export const Flowchart: React.FC<FlowchartProps> = ({ milestones, title, description }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-stretch justify-center gap-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center text-center max-w-sm">
                <div 
                  className="w-full bg-secondary text-secondary-foreground rounded-lg flex flex-col justify-start items-center p-4 shadow-md flex-grow"
                >
                  <div className="font-bold text-base mb-2">{milestone.label}</div>
                  <div className="font-semibold text-sm mb-3">{milestone.title}</div>
                  {milestone.tasks && (
                    <ul className="list-disc pl-5 space-y-1 text-left text-xs text-muted-foreground">
                      {milestone.tasks.slice(0, 3).map((task, i) => (
                        <li key={i} className="truncate" title={task}>{task}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {index < milestones.length - 1 && (
                <ChevronRight className="w-8 h-8 text-muted-foreground mx-2 self-center shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
