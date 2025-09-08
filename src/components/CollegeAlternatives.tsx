
'use client';
import React from 'react';
import { Building, CheckCircle, XCircle, DollarSign, Target, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SuggestCollegesOutput } from '@/ai/flows/college-recommendation';

interface CollegeAlternativesProps {
  colleges: SuggestCollegesOutput | null;
}

export const CollegeAlternatives: React.FC<CollegeAlternativesProps> = ({ colleges }) => {
  if (!colleges || colleges.alternatives.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>No college alternatives could be generated at this time. Please try adjusting your profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {colleges.alternatives.map((college, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Building className="w-6 h-6 text-primary" />
                        {college.name}
                    </CardTitle>
                    <CardDescription>
                        <Badge variant={college.type === 'Public' ? 'secondary' : 'default'} className="mt-2">
                            {college.type}
                        </Badge>
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 text-sm">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 mt-1 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">Required Exams</h4>
                  <p className="text-muted-foreground">{college.requiredExams}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 mt-1 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">Previous Year's Rank</h4>
                  <p className="text-muted-foreground">{college.previousYearRank}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 mt-1 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">Estimated Cost</h4>
                  <p className="text-muted-foreground">{college.costBreakdown}</p>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                    <div className='flex items-center gap-2'>
                        <Info className='w-4 h-4' />
                        Detailed Breakdown
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-base mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> Advantages</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {college.advantages.map((adv, i) => (
                          <li key={i}>{adv}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-3 flex items-center gap-2"><TrendingDown className="w-5 h-5 text-red-500" /> Disadvantages</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {college.disadvantages.map((dis, i) => (
                          <li key={i}>{dis}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-blue-500" /> Eligibility Criteria</h4>
                      <p className="text-muted-foreground">{college.eligibilityCriteria}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
