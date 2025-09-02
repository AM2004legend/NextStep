'use client';

import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
  },
});

export const MermaidRenderer = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const { theme } = useTheme();
  const [key, setKey] = useState(0);

  useEffect(() => {
    const renderChart = async () => {
      try {
        // Remove backticks and 'mermaid' from the beginning of the string
        const cleanedChart = chart.replace(/^```mermaid\n/, '').replace(/```$/, '');
        const { svg: svgCode } = await mermaid.render('mermaid-graph', cleanedChart);
        setSvg(svgCode);
        setKey(prev => prev + 1);
      } catch (error) {
        console.error('Error rendering Mermaid chart:', error);
        setSvg('<p>Error rendering chart. Please check the Mermaid syntax.</p>');
      }
    };
    renderChart();
  }, [chart, theme]);
  
  // The key is important to force a re-render when the svg changes.
  return svg ? <div key={key} className="w-full flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} /> : <p>Loading chart...</p>;
};
