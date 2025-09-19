
'use client';
import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, School, Search, Link as LinkIcon, BarChart, BadgeDollarSign, ClipboardCheck, University, Building } from 'lucide-react';
import { suggestColleges, type SuggestCollegesOutput } from '@/ai/flows/college-suggester';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PointerHighlight } from './ui/pointer-highlight';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const formSchema = z.object({
  course: z.string().min(3, 'Please enter a course.'),
  degreeLevel: z.string().min(3, 'Please enter your target degree level.'),
  interests: z.string().min(3, 'Please enter at least one interest.'),
  preferences: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const CollegeSuggester: React.FC = () => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<SuggestCollegesOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { course: '', degreeLevel: '', interests: '', preferences: '' },
  });

  const onSubmit = (values: FormValues) => {
    setSuggestions(null);
    startTransition(async () => {
      const result = await suggestColleges(values);
      if (result) {
        setSuggestions(result);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch college suggestions. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle><PointerHighlight>Higher Education</PointerHighlight></CardTitle>
        <CardDescription>Discover colleges for your next degree. Get detailed insights on exams, cutoffs, and costs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Target Course</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., M.Tech in AI" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="degreeLevel"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Degree Level</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Postgraduate, PhD" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Interests</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AI, Robotics, Cybersecurity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferences (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., India, USA, or a specific college like 'IIT Bombay'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</> : <><Search className="mr-2" />Find Institutions</>}
            </Button>
          </form>
        </Form>

        {isPending && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

        {suggestions && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold font-headline mb-4"><PointerHighlight>Suggested Institutions</PointerHighlight></h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
                {suggestions.colleges.map((college, index) => (
                <AccordionItem value={`item-${index}`} key={college.collegeName} className="border-b-0">
                    <AccordionTrigger className="p-4 bg-primary/5 hover:bg-primary/10 rounded-lg">
                        <div className="flex items-center gap-4 text-left">
                            {college.type === 'Public' ? <Building className="h-5 w-5 text-primary"/> : <University className="h-5 w-5 text-primary"/>}
                            <div className="flex flex-col">
                                <span className='font-bold text-base'>{college.collegeName}</span>
                                <span className="text-sm text-muted-foreground">{college.location}</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4">
                        <p className="text-muted-foreground">{college.notableFor}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-3">
                                <ClipboardCheck className="h-4 w-4 mt-0.5 text-primary"/>
                                <div><span className="font-semibold">Exams:</span> {college.requiredExams}</div>
                            </div>
                            <div className="flex items-start gap-3">
                                <BarChart className="h-4 w-4 mt-0.5 text-primary"/>
                                <div><span className="font-semibold">Cutoff/Rank:</span> {college.previousYearCutoff}</div>
                            </div>
                            <div className="flex items-start gap-3 col-span-full">
                                <BadgeDollarSign className="h-4 w-4 mt-0.5 text-primary"/>
                                <div><span className="font-semibold">Estimated Cost:</span> {college.costBreakdown}</div>
                            </div>
                        </div>
                        <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm font-semibold">
                            <LinkIcon className="h-3 w-3" /> Visit Website
                        </a>
                    </AccordionContent>
                </AccordionItem>
                ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
