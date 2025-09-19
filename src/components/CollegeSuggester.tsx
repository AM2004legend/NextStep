'use client';
import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, School, Search, Link as LinkIcon } from 'lucide-react';
import { suggestColleges, type SuggestCollegesOutput } from '@/ai/flows/college-suggester';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { PointerHighlight } from './ui/pointer-highlight';

const formSchema = z.object({
  course: z.string().min(3, 'Please enter a course.'),
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
    defaultValues: { course: '', interests: '', preferences: '' },
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
        <CardTitle><PointerHighlight>College Suggester</PointerHighlight></CardTitle>
        <CardDescription>Find the right college for your desired course and interests.</CardDescription>
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
                        <Input placeholder="e.g., Computer Science Engineering" {...field} />
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
                        <Input placeholder="e.g., AI, Robotics, Cybersecurity" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Preferences (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., India, USA, Europe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</> : <><Search className="mr-2" />Find Colleges</>}
            </Button>
          </form>
        </Form>

        {isPending && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

        {suggestions && (
          <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-bold font-headline"><PointerHighlight>Suggested Colleges</PointerHighlight></h3>
            {suggestions.colleges.map((college) => (
              <Alert key={college.collegeName}>
                <School className="h-4 w-4" />
                <AlertTitle className='font-bold'>{college.collegeName} <span className="text-muted-foreground font-normal">- {college.location}</span></AlertTitle>
                <AlertDescription>
                  <p className="mb-2">{college.notableFor}</p>
                  <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    <LinkIcon className="h-3 w-3" /> Website
                  </a>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
