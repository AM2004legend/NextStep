'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Milestone {
  label: string;
  title: string;
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
        <div className="flex items-center overflow-x-auto pb-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center text-center">
                <div 
                  className="w-48 h-24 bg-secondary text-secondary-foreground rounded-lg flex flex-col justify-center items-center p-2 shadow-md"
                >
                  <div className="font-bold text-sm">{milestone.label}</div>
                  <div className="text-xs">{milestone.title}</div>
                </div>
              </div>

              {index < milestones.length - 1 && (
                <ChevronRight className="w-8 h-8 text-muted-foreground mx-2" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
