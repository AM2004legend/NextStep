
'use client';
import React, { useState, useTransition, type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ListTodo, Route, School, Music, PlayCircle, PauseCircle } from 'lucide-react';
import { generateSchoolRoadmap, type GenerateSchoolRoadmapOutput } from '@/ai/flows/school-student-roadmap';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const schoolFormSchema = z.object({
  academicBackground: z.string().min(10, 'Please provide more details.'),
  interests: z.string().min(3, 'Please list at least one interest.'),
  target: z.string().min(3, 'e.g. IIT, AIIMS, Ivy League'),
  learningStyle: z.enum(['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic']),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;


interface FlowchartProps {
    milestones: GenerateSchoolRoadmapOutput['milestones'];
    title: string;
    isAuditory: boolean;
}
  
const Flowchart: React.FC<FlowchartProps> = ({ milestones, title, isAuditory }) => {
    const [speakingId, setSpeakingId] = useState<string | null>(null);

    const speak = (text: string, id: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      
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

    return (
        <div className="relative pt-6">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border" />
            {milestones.map((milestone, index) => (
                <div key={milestone.quarter} className="relative mb-8">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-3 h-3 rounded-full bg-primary" />
                    <Card className={`md:w-10/12 mx-auto ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                    <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Quarter {milestone.quarter}: {milestone.title}</CardTitle>
                        {isAuditory && (
                            <Button variant="ghost" size="icon" onClick={() => speak(`Quarter ${milestone.quarter}: ${milestone.title}. Tasks: ${milestone.tasks.join('. ')}`, `quarter-${milestone.quarter}`)}>
                                {speakingId === `quarter-${milestone.quarter}` ? <PauseCircle /> : <PlayCircle />}
                            </Button>
                        )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {milestone.tasks.map((task, i) => (
                            <li key={i}>{task}</li>
                        ))}
                        </ul>
                    </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    )
}

export const SchoolStudentForm: FC = () => {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [schoolRoadmap, setSchoolRoadmap] = useState<GenerateSchoolRoadmapOutput | null>(null);
    const [schoolProfile, setSchoolProfile] = useState<SchoolFormValues | null>(null);
    
    const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
          if (activeAudio) {
            activeAudio.pause();
          }
        };
      }, [activeAudio]);

    const schoolForm = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolFormSchema),
        defaultValues: { academicBackground: '', interests: '', target: '', learningStyle: 'Visual' },
    });


    const onSchoolSubmit = (values: SchoolFormValues) => {
        setSchoolProfile(values);
        setSchoolRoadmap(null);
        startTransition(async () => {
            const studentProfile = `Academic Background: ${values.academicBackground}, Interests: ${values.interests}, Target Colleges/Courses: ${values.target}`;
            const result = await generateSchoolRoadmap({
                studentProfile,
                learningStyle: values.learningStyle,
            });

            if (result) {
                setSchoolRoadmap(result);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not generate a school roadmap. Please try again.',
                });
            }
        });
    };

    const renderSection = (icon: React.ReactNode, title: string, description: string, step: number, children: React.ReactNode) => (
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">{icon}</div>
            <div className="flex-grow w-px bg-border my-4"></div>
          </div>
          <div className="flex-1 pb-12">
            <div className="text-sm font-semibold text-primary mb-1">STEP {step}</div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 font-headline">{title}</h2>
            <div className="text-muted-foreground mb-6 max-w-2xl">{description}</div>
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </div>
      );

    const renderSchoolResults = () => {
        if (isPending) {
            return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
        }
        
        if (schoolRoadmap && schoolProfile) {
            const isAuditory = schoolProfile.learningStyle === 'Auditory';
            return renderSection(<ListTodo />, "Your College Prep Plan", "Here is your actionable plan to get into your dream college.", 2,
            <Tabs defaultValue={isAuditory ? "audio" : "visual"}>
                <TabsList>
                    <TabsTrigger value="visual">Visual Roadmap</TabsTrigger>
                    <TabsTrigger value="audio" disabled={!isAuditory}>Audio Guide</TabsTrigger>
                </TabsList>
                <TabsContent value="visual">
                    <Flowchart milestones={schoolRoadmap.milestones} title="College Prep Timeline" isAuditory={isAuditory}/>
                </TabsContent>
                <TabsContent value="audio">
                <Card>
                    <CardHeader><CardTitle>Audio Guide</CardTitle><CardDescription>Listen to your personalized roadmap.</CardDescription></CardHeader>
                    <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {schoolRoadmap.milestones.map((milestone) => (
                        <AccordionItem key={milestone.quarter} value={`item-${milestone.quarter}`}>
                            <AccordionTrigger className="text-lg">Quarter {milestone.quarter}: {milestone.title}</AccordionTrigger>
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
                    </CardContent>
                </Card>
                </TabsContent>
            </Tabs>
            );
        }

        return null;
    }
    
    return (
        <div>
            {renderSection(<School />, "Plan for College", "Get a personalized roadmap to help you get into your dream college. Just fill out the form below to get started.", 1, 
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
                                <SelectItem value="Reading/Writing">Reading/Writing</SelectItem>
                                <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
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
            )}
            
            {renderSchoolResults()}
        </div>
    )
}
