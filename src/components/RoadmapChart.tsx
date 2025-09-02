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
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg max-w-sm">
        <p className="font-bold text-lg mb-2">{`${data.title}`}</p>
        <ul className="list-disc pl-5 space-y-1">
          {data.tasks.map((task: string, index: number) => (
            <li key={index} className="text-sm">{task}</li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};


export const RoadmapChart: React.FC<RoadmapChartProps> = ({ milestones, title, description, dataKey }) => {
  const chartData = milestones.map(m => ({
    name: dataKey === 'month' ? `Month ${m.month}` : `Quarter ${m.quarter}`,
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
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barCategoryGap="20%">
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
