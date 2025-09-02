'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, TooltipProps } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface Milestone {
  month?: number;
  quarter?: number;
  title: string;
  tasks: string[];
}

interface RoadmapChartProps {
  milestones: Milestone[];
  title: string;
  description: string;
  dataKey: 'month' | 'quarter';
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const labelPrefix = data.month ? 'Month' : 'Quarter';
    const labelValue = data.month || data.quarter;
    
    return (
      <div className="bg-background border border-border p-4 rounded-lg shadow-lg max-w-sm text-sm">
        <p className="font-bold text-base mb-2">{`${labelPrefix} ${labelValue}: ${data.title}`}</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          {data.tasks.map((task: string, index: number) => (
            <li key={index}>{task}</li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};


export const RoadmapChart: React.FC<RoadmapChartProps> = ({ milestones, title, description, dataKey }) => {
  const chartData = milestones.map(m => ({
    name: dataKey === 'month' ? `Month ${m.month}` : `Q${m.quarter}`,
    value: 1, // All bars have the same height
    ...m
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name"
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 12 }} 
            />
            <YAxis hide={true} domain={[0, 1]}/>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}/>
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
