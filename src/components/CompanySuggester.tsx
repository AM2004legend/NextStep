'use client';
import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Briefcase, Search, DollarSign, Building, Sparkles } from 'lucide-react';
import { suggestCompanies, type SuggestCompaniesOutput } from '@/ai/flows/company-suggester';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PointerHighlight } from './ui/pointer-highlight';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';

const formSchema = z.object({
  careerPath: z.string().min(3, 'Please enter a career path.'),
});

type FormValues = z.infer<typeof formSchema>;

export const CompanySuggester: React.FC = () => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<SuggestCompaniesOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { careerPath: '' },
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
          description: 'Could not fetch company suggestions. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle><PointerHighlight>Company Suggester</PointerHighlight></CardTitle>
        <CardDescription>Discover top companies for your chosen career, with salary insights and hiring requirements.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="careerPath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Career Path</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Software Engineer, Product Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</> : <><Search className="mr-2" />Find Companies</>}
            </Button>
          </form>
        </Form>

        {isPending && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

        {suggestions && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold font-headline mb-4"><PointerHighlight>Suggested Companies</PointerHighlight></h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {suggestions.companies.map((company, index) => (
                <AccordionItem value={`item-${index}`} key={company.companyName} className="border-b-0">
                  <AccordionTrigger className="p-4 bg-primary/5 hover:bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-4 text-left">
                        <Building className="h-5 w-5 text-primary"/>
                        <div className="flex flex-col">
                            <span className='font-bold text-base'>{company.companyName}</span>
                            <span className="text-sm text-muted-foreground">{company.industry}</span>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 space-y-4">
                    <p className="text-muted-foreground">{company.why}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <DollarSign className="h-4 w-4 mt-0.5 text-primary"/>
                            <div><span className="font-semibold">CTC Range:</span> {company.salaryRange}</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Sparkles className="h-4 w-4 mt-0.5 text-primary"/>
                            <div><span className="font-semibold">Hiring Insights:</span> {company.hiringInsights}</div>
                        </div>
                    </div>
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
