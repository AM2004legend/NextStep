'use client';

import { useState, type FC, useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ChecklistItem: FC<{ line: string }> = ({ line }) => {
  const id = useId();
  const isInitiallyChecked = line.startsWith('- [x]');
  const [checked, setChecked] = useState(isInitiallyChecked);
  const text = line.replace(/- \[[x ]\] /, '').trim();

  return (
    <div className="flex items-center gap-3 py-1">
      <Checkbox 
        id={id} 
        checked={checked} 
        onCheckedChange={(c) => setChecked(c as boolean)} 
      />
      <Label htmlFor={id} className={`flex-1 text-base ${checked ? 'line-through text-muted-foreground' : ''}`}>
        {text}
      </Label>
    </div>
  );
};

export const MarkdownRenderer: FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold mt-6 mb-2 pb-2 border-b font-headline">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold mt-8 mb-3 pb-2 border-b font-headline">{line.substring(3)}</h2>;
        }
        if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
          return <ChecklistItem key={index} line={line} />;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>
        }
        return <p key={index} className="text-base leading-relaxed">{line}</p>;
      })}
    </div>
  );
};
