
'use client';
import React, { useState, useTransition, type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ListTodo, Route, School, Music, PlayCircle, PauseCircle, Square } from 'lucide-react';
import { generateSchoolRoadmap, type GenerateSchoolRoadmapOutput } from '@/ai/flows/school-student-roadmap';


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

const schoolFormSchema = z.object({
  academicBackground: z.string().min(10, 'Please provide more details.'),
  interests: z.string().min(3, 'Please list at least one interest.'),
  target: z.string().min(3, 'e.g. IIT, AIIMS, Ivy League'),
  learningStyle: z.enum(['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic']),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export const SchoolStudentForm: FC = () => {
    const { toast } = useToast();
    const [isSchoolRoadmapPending, startSchoolRoadmapTransition] = useTransition();

    const [schoolRoadmap, setSchoolRoadmap] = useState<GenerateSchoolRoadmapOutput | null>(null);
    const [schoolProfile, setSchoolProfile] = useState<SchoolFormValues | null>(null);

    const [speaking, setSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
        window.speechSynthesis.onvoiceschanged = () => {}; // Ensure voices are loaded

        return () => {
          if(typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
        };
    }, []);

    const speak = ({ text }: {text: string}) => {
        if (!supported) return;
        setSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
      };
  
    const cancel = () => {
        if (!supported) return;
        setSpeaking(false);
        window.speechSynthesis.cancel();
    }

    const schoolForm = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolFormSchema),
        defaultValues: { academicBackground: '', interests: '', target: '', learningStyle: 'Visual' },
    });


    const onSchoolSubmit = (values: SchoolFormValues) => {
        setSchoolProfile(values);
        setSchoolRoadmap(null);
        startSchoolRoadmapTransition(async () => {
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

    const renderSchoolRoadmap = () => {
        if (isSchoolRoadmapPending) {
            return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
        }
        
        if (!schoolRoadmap || !schoolProfile) return null;

        if (schoolProfile.learningStyle === 'Auditory' && schoolRoadmap.roadmapSummary) {
            if (!supported) {
                return (
                   <Section icon={<Music />} title="Audio Roadmap Unavailable" description="Your browser does not support speech synthesis." step={4}>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-muted-foreground">We can't play the audio roadmap because your browser doesn't support the required technology. Please try a different browser like Chrome or Firefox.</p>
                        </CardContent>
                      </Card>
                   </Section>
                )
            }
            return (
                <Section icon={<Music />} title="Your Audio Roadmap" description="Listen to your personalized college prep plan.">
                <Card>
                    <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Button onClick={() => speak({ text: schoolRoadmap.roadmapSummary! })} size="lg" disabled={speaking}>
                            {speaking ? <PauseCircle className="mr-2" /> : <PlayCircle className="mr-2" />}
                            {speaking ? 'Speaking...' : 'Listen to Roadmap'}
                        </Button>
                        <Button onClick={cancel} size="lg" variant="outline" disabled={!speaking}>
                            <Square className="mr-2" />
                            Stop
                        </Button>
                    </div>
                    </CardContent>
                </Card>
                </Section>
            );
        }
        
        return (
            <Section icon={<ListTodo />} title="Your College Prep Roadmap" description="Here is your visual flowchart and detailed plan for your college entrance preparation.">
            <Flowchart
            title="College Prep Timeline"
            description="A quarterly guide to your success."
            milestones={schoolRoadmap.milestones.map(m => ({ label: `Quarter ${m.quarter}`, title: m.title, tasks: m.tasks }))}
            />
            <Accordion type="single" collapsible className="w-full mt-4">
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
        </Section>
        );
    }
    
    return (
        <div>
            <Section icon={<School />} title="Plan for College" description="Get a personalized roadmap to help you get into your dream college. Just fill out the form below to get started.">
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
                        <Button type="submit" size="lg" disabled={isSchoolRoadmapPending} className="w-full">
                        {isSchoolRoadmapPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building Roadmap...</> : <><Route className="mr-2" /> Generate College Prep Roadmap</>}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
                </Card>
            </Section>
            
            {renderSchoolRoadmap()}
        </div>
    )
}
