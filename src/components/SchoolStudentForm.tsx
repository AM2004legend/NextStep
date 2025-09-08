
'use client';
import React, { useState, useTransition, type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ListTodo, Route, School, Music, PlayCircle, PauseCircle, Square, Volume2, Compass } from 'lucide-react';
import { generateSchoolRoadmap, type GenerateSchoolRoadmapOutput } from '@/ai/flows/school-student-roadmap';
import { suggestColleges, type SuggestCollegesOutput } from '@/ai/flows/college-recommendation';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Flowchart } from '@/components/Flowchart';
import { Section } from '@/components/Section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollegeAlternatives } from '@/components/CollegeAlternatives';


const schoolFormSchema = z.object({
  academicBackground: z.string().min(10, 'Please provide more details.'),
  interests: z.string().min(3, 'Please list at least one interest.'),
  target: z.string().min(3, 'e.g. IIT, AIIMS, Ivy League'),
  learningStyle: z.enum(['Visual', 'Auditory']),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export const SchoolStudentForm: FC = () => {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [schoolRoadmap, setSchoolRoadmap] = useState<GenerateSchoolRoadmapOutput | null>(null);
    const [collegeSuggestions, setCollegeSuggestions] = useState<SuggestCollegesOutput | null>(null);
    const [schoolProfile, setSchoolProfile] = useState<SchoolFormValues | null>(null);

    const [speakingId, setSpeakingId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => {
          if(typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
        };
    }, []);

    const speak = (text: string, id: string) => {
        if (!isMounted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        
        if (speakingId === id) {
            window.speechSynthesis.cancel();
            setSpeakingId(null);
            return;
        }

        setSpeakingId(id);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setSpeakingId(null);
        };
        window.speechSynthesis.speak(utterance);
      };

    const schoolForm = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolFormSchema),
        defaultValues: { academicBackground: '', interests: '', target: '', learningStyle: 'Visual' },
    });


    const onSchoolSubmit = (values: SchoolFormValues) => {
        setSchoolProfile(values);
        setSchoolRoadmap(null);
        setCollegeSuggestions(null);

        startTransition(async () => {
            const studentProfile = `Academic Background: ${values.academicBackground}, Interests: ${values.interests}, Target Colleges/Courses: ${values.target}`;
            
            try {
                const [roadmapResult, suggestionsResult] = await Promise.all([
                    generateSchoolRoadmap({
                        studentProfile,
                        learningStyle: values.learningStyle,
                    }),
                    suggestColleges({ studentProfile })
                ]);

                if (roadmapResult) {
                    setSchoolRoadmap(roadmapResult);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Could not generate a school roadmap. Please try again.',
                    });
                }

                if (suggestionsResult) {
                    setCollegeSuggestions(suggestionsResult);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Could not generate college suggestions. Please try again.',
                    });
                }
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'An Unexpected Error Occurred',
                    description: 'Please try again later.',
                });
            }
        });
    };

    const renderSchoolResults = () => {
        if (isPending) {
            return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
        }
        
        if (!schoolRoadmap || !schoolProfile || !isMounted) return null;
        
        const isAuditory = schoolProfile.learningStyle === 'Auditory';

        return (
            <Section icon={<ListTodo />} title="Your Results" description="Here is your personalized roadmap and college suggestions." step={2}>
              <Tabs defaultValue="roadmap">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="roadmap"><Route className="mr-2 h-4 w-4"/>Roadmap</TabsTrigger>
                    <TabsTrigger value="colleges"><Compass className="mr-2 h-4 w-4"/>College Explorer</TabsTrigger>
                </TabsList>
                <TabsContent value="roadmap" className="mt-6">
                    <Flowchart
                    title="College Prep Timeline"
                    description="A quarterly guide to your success."
                    milestones={schoolRoadmap.milestones.map(m => ({ 
                        label: `Quarter ${m.quarter}`, 
                        title: m.title, 
                        tasks: m.tasks,
                        isAuditory,
                        isSpeaking: speakingId === `flow-quarter-${m.quarter}`,
                        onSpeak: () => speak(`Quarter ${m.quarter}: ${m.title}. Tasks: ${m.tasks.join('. ')}`, `flow-quarter-${m.quarter}`)
                    }))}
                    />
                    <Accordion type="single" collapsible className="w-full mt-4">
                    {schoolRoadmap.milestones.map((milestone) => (
                        <AccordionItem key={milestone.quarter} value={`item-${milestone.quarter}`}>
                            <AccordionTrigger className="text-lg">
                                <div className="flex items-center justify-between w-full">
                                    <span>Quarter {milestone.quarter}: {milestone.title}</span>
                                    {isAuditory && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                speak(`Quarter ${milestone.quarter}: ${milestone.title}. Tasks: ${milestone.tasks.join('. ')}`, `accordion-quarter-${milestone.quarter}`);
                                            }}
                                            className="mr-2"
                                        >
                                            <Volume2 className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                {milestone.tasks.map((task, index) => (
                                    <li key={index}>{task}</li>
                                ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </TabsContent>
                <TabsContent value="colleges" className="mt-6">
                    <CollegeAlternatives colleges={collegeSuggestions} />
                </TabsContent>
              </Tabs>
        </Section>
        );
    }
    
    return (
        <div>
            <Section icon={<School />} title="Plan for College" description="Get a personalized roadmap to help you get into your dream college. Just fill out the form below to get started." step={1}>
                <Card>
                <CardContent className="pt-6">
                    <Form {...schoolForm}>
                    <form onSubmit={schoolForm.handleSubmit(onSchoolSubmit)} className="space-y-6">
                        <FormField control={schoolForm.control} name="academicBackground" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Grade & Subjects</FormLabel>
                            <FormControl>
                            <Textarea placeholder="e.g., Class 11, Science with Physics, Chemistry, Math" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                        <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={schoolForm.control} name="interests" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Subjects of Interest</FormLabel>
                            <FormControl><Input placeholder="e.g., Computer Science, Biology" {...field} /></FormControl>
                            <FormDescription>Separate with commas.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={schoolForm.control} name="target" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Target Colleges or Courses</FormLabel>
                            <FormControl><Input placeholder="e.g., IIT, AIIMS, Ivy League" {...field} /></FormControl>
                            <FormDescription>What's your dream school?</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )} />
                        </div>
                        <FormField control={schoolForm.control} name="learningStyle" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Preferred Learning Style</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select your learning style" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Visual">Visual</SelectItem>
                                <SelectItem value="Auditory">Auditory</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )} />
                        <Button type="submit" size="lg" disabled={isPending} className="w-full">
                        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building Plan...</> : <><Route className="mr-2" /> Generate College Prep Plan</>}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
                </Card>
            </Section>
            
            {renderSchoolResults()}
        </div>
    )
}
