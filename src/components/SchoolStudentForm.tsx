
'use client';
import React, { useState, useTransition, type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ListTodo, Route, School, Music, PlayCircle, PauseCircle, Library } from 'lucide-react';
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
import { PointerHighlight } from './ui/pointer-highlight';
import { CollegeSuggester } from './CollegeSuggester';

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
}
  
const Flowchart: React.FC<FlowchartProps> = ({ milestones, title }) => {
    const [speakingId, setSpeakingId] = useState<string | null>(null);

    const speak = (text: string, id: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      
        if (speakingId === id) {
          window.speechSynthesis.cancel();
          setSpeakingId(null);
          return;
        }
        
        // Cancel any previous speech
        window.speechSynthesis.cancel();
      
        setSpeakingId(id);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setSpeakingId(null);
        };
        window.speechSynthesis.speak(utterance);
      };

    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            {milestones.map((milestone, index) => (
                <AccordionItem value={`item-${index}`} key={milestone.quarter} className="border-b-0">
                    <AccordionTrigger className="p-4 bg-primary/5 hover:bg-primary/10 rounded-lg justify-between">
                        <div className="flex items-center gap-4 text-left">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">Q{milestone.quarter}</div>
                            <div className="flex flex-col">
                                <span className='font-bold text-base text-left'>{milestone.title}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); speak(`Quarter ${milestone.quarter}: ${milestone.title}. Tasks: ${milestone.tasks.join('. ')}`, `quarter-${milestone.quarter}`)}}>
                            {speakingId === `quarter-${milestone.quarter}` ? <PauseCircle /> : <PlayCircle />}
                        </Button>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4">
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {milestone.tasks.map((task, i) => (
                           <li key={i} dangerouslySetInnerHTML={{ __html: task.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>') }}></li>
                        ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

export const SchoolStudentForm: FC = () => {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [schoolRoadmap, setSchoolRoadmap] = useState<GenerateSchoolRoadmapOutput | null>(null);
    const [schoolProfile, setSchoolProfile] = useState<SchoolFormValues | null>(null);
    
    useEffect(() => {
        return () => {
            // Cleanup speech synthesis on component unmount
            if (typeof window !== 'undefined' && ('speechSynthesis' in window)) {
                window.speechSynthesis.cancel();
            }
        };
      }, []);

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

    const renderSection = (icon: React.ReactNode, title: string, description: string, children: React.ReactNode) => (
        <div className="space-y-8">
            <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">{icon}</div>
                <h2 className="text-3xl font-bold tracking-tight mb-2 font-headline"><PointerHighlight>{title}</PointerHighlight></h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
            </div>
            <div className="space-y-6">
              {children}
            </div>
        </div>
      );

    const renderSchoolResults = () => {
        if (isPending) {
            return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
        }
        
        if (schoolRoadmap && schoolProfile) {
            return (
                <div className="mt-12">
                    {renderSection(<ListTodo />, "Your College Prep Plan", "Here is your actionable plan to get into your dream college.",
                        <Flowchart milestones={schoolRoadmap.milestones} title="College Prep Timeline"/>
                    )}
                </div>
            );
        }

        return null;
    }
    
    return (
        <Tabs defaultValue="roadmap" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="roadmap"><Route className="mr-2 h-4 w-4"/>Prep Roadmap</TabsTrigger>
                <TabsTrigger value="resources"><Library className="mr-2 h-4 w-4"/>Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap" className="mt-8">
                {renderSection(<School />, "Plan for College", "Get a personalized roadmap to help you get into your dream college. Just fill out the form below to get started.", 
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
            </TabsContent>
            
            <TabsContent value="resources" className="mt-8">
                <CollegeSuggester />
            </TabsContent>
        </Tabs>
    )
}

    