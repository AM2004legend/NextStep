'use client';
import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Briefcase, Search, DollarSign, Building, Sparkles, Shield, ThumbsUp, ThumbsDown, Link as LinkIcon, GraduationCap } from 'lucide-react';
import { suggestCompanies, type SuggestCompaniesOutput } from '@/ai/flows/company-suggester';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PointerHighlight } from './ui/pointer-highlight';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const formSchema = z.object({
  degree: z.string().min(3, 'Please enter your degree.'),
  skills: z.string().min(3, 'Please enter your skills.'),
  interests: z.string().min(3, 'Please enter your interests.'),
});

type FormValues = z.infer<typeof formSchema>;

export const CompanySuggester: React.FC = () => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<SuggestCompaniesOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { degree: '', skills: '', interests: '' },
  });

  const onSubmit = (values: FormValues) => {
    setSuggestions(null);
    startTransition(async () => {
      const result = await suggestCompanies(values);
      if (result) {
        setSuggestions(result);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch career opportunity suggestions. Please try again.',
        });
      }
    });
  };

  const getIconForField = (field: string) => {
    const lowerCaseField = field.toLowerCase();
    if (lowerCaseField.includes('tech')) return <Briefcase className="h-5 w-5 text-primary"/>;
    if (lowerCaseField.includes('public') || lowerCaseField.includes('government')) return <Building className="h-5 w-5 text-primary"/>;
    if (lowerCaseField.includes('defense') || lowerCaseField.includes('army')) return <Shield className="h-5 w-5 text-primary"/>;
    return <Briefcase className="h-5 w-5 text-primary"/>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle><PointerHighlight>Future Endeavors</PointerHighlight></CardTitle>
        <CardDescription>Explore diverse career opportunities—from corporate roles to public service—tailored to your profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Degree</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., B.Tech in CSE, MBA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Python, Machine Learning" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Interests</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Public service, technology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Exploring...</> : <><Search className="mr-2" />Explore Opportunities</>}
            </Button>
          </form>
        </Form>

        {isPending && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

        {suggestions && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold font-headline mb-4"><PointerHighlight>Suggested Opportunities</PointerHighlight></h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {suggestions.opportunities.map((opp, index) => (
                <AccordionItem value={`item-${index}`} key={opp.name} className="border-b-0">
                  <AccordionTrigger className="p-4 bg-primary/5 hover:bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-4 text-left">
                        {getIconForField(opp.field)}
                        <div className="flex flex-col">
                            <span className='font-bold text-base'>{opp.name}</span>
                            <span className="text-sm text-muted-foreground">{opp.field}</span>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 space-y-4">
                    <p className="text-muted-foreground">{opp.description}</p>
                    
                    <div className="flex items-start gap-3 text-sm">
                      <GraduationCap className="h-4 w-4 mt-0.5 text-primary shrink-0"/>
                      <div><span className="font-semibold">Entry Requirements:</span> {opp.entryRequirements}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2"><ThumbsUp className="h-4 w-4 text-green-500"/> Pros</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {opp.pros.map(pro => <li key={pro}>{pro}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2"><ThumbsDown className="h-4 w-4 text-red-500"/> Cons</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {opp.cons.map(con => <li key={con}>{con}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                        <DollarSign className="h-4 w-4 mt-0.5 text-primary shrink-0"/>
                        <div><span className="font-semibold">Salary & Perks:</span> {opp.salaryAndPerks}</div>
                    </div>
                    
                    <a href={opp.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm font-semibold">
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
