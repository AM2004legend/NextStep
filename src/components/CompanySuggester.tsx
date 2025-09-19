'use client';
import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Briefcase, Search, DollarSign, Building } from 'lucide-react';
import { suggestCompanies, type SuggestCompaniesOutput } from '@/ai/flows/company-suggester';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { PointerHighlight } from './ui/pointer-highlight';
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
        <CardDescription>Discover top companies that hire for your chosen career path.</CardDescription>
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
          <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-bold font-headline"><PointerHighlight>Suggested Companies</PointerHighlight></h3>
            {suggestions.companies.map((company) => (
              <Alert key={company.companyName}>
                <Building className="h-4 w-4" />
                <AlertTitle className='font-bold'>{company.companyName}</AlertTitle>
                <AlertDescription>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{company.industry}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground gap-1">
                            <DollarSign className="h-4 w-4"/>
                            <span>{company.salaryRange}</span>
                        </div>
                    </div>
                  <p>{company.why}</p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
