
'use client';

import React, { useState, useTransition, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Briefcase, Target, GraduationCap, Lightbulb, BookOpen, ChevronRight, Loader2, Compass, CheckCircle2, ListTodo, Route, School } from 'lucide-react';
import { careerPathRecommendation, type CareerPathRecommendationOutput } from '@/ai/flows/career-path-recommendation';
import { analyzeSkillGaps, type AnalyzeSkillGapsOutput } from '@/ai/flows/skill-gap-analysis';
import { generateRoadmap, type GenerateRoadmapOutput } from '@/ai/flows/personalized-roadmap-generation';
import { exploreCareerPaths, type CareerPathExplorationOutput } from '@/ai/flows/career-path-exploration';
import { generateSchoolRoadmap, type GenerateSchoolRoadmapOutput } from '@/ai/flows/school-student-roadmap';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Flowchart } from '@/components/Flowchart';

const profileFormSchema = z.object({
  academicBackground: z.string().min(10, 'Please provide more details.'),
  interests: z.string().min(3, 'Please list at least one interest.'),
  skills: z.string().min(3, 'Please list at least one skill.'),
  goals: z.string().min(10, 'Please describe your career goals.'),
  learningStyle: z.enum(['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic']),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const schoolFormSchema = z.object({
  academicBackground: z.string().min(10, 'Please provide more details.'),
  interests: z.string().min(3, 'Please list at least one interest.'),
  target: z.string().min(3, 'e.g. IIT, AIIMS, Ivy League'),
  learningStyle: z.enum(['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic']),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;


const explorerFormSchema = z.object({
  interests: z.string().min(3, { message: "Please enter at least one interest." }),
  skills: z.string().min(3, { message: "Please enter at least one skill." }),
  goals: z.string().optional(),
  academicBackground: z.string().optional(),
});

type ExplorerFormValues = z.infer<typeof explorerFormSchema>;


export default function Home() {
  const { toast } = useToast();
  const [isRecsPending, startRecsTransition] = useTransition();
  const [isGapsPending, startGapsTransition] = useTransition();
  const [isRoadmapPending, startRoadmapTransition] = useTransition();
  const [isExplorerPending, startExplorerTransition] = useTransition();
  const [isSchoolRoadmapPending, startSchoolRoadmapTransition] = useTransition();

  const [recommendations, setRecommendations] = useState<CareerPathRecommendationOutput | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [skillGaps, setSkillGaps] = useState<AnalyzeSkillGapsOutput | null>(null);
  const [roadmap, setRoadmap] = useState<GenerateRoadmapOutput | null>(null);
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  
  const [exploredCareers, setExploredCareers] = useState<CareerPathExplorationOutput | null>(null);
  const [schoolRoadmap, setSchoolRoadmap] = useState<GenerateSchoolRoadmapOutput | null>(null);


  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { academicBackground: '', interests: '', skills: '', goals: '', learningStyle: 'Visual' },
  });

  const schoolForm = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: { academicBackground: '', interests: '', target: '', learningStyle: 'Visual' },
  });

  const explorerForm = useForm<ExplorerFormValues>({
    resolver: zodResolver(explorerFormSchema),
    defaultValues: { interests: '', skills: '', goals: '', academicBackground: '' },
  });
  
  const onSchoolSubmit = (values: SchoolFormValues) => {
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

  const onProfileSubmit = (values: ProfileFormValues) => {
    setProfile(values);
    setRecommendations(null);
    setSelectedCareer(null);
    setSkillGaps(null);
    setRoadmap(null);
    startRecsTransition(async () => {
      const result = await careerPathRecommendation(values);
      if (result) {
        setRecommendations(result);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate career recommendations. Please try again.',
        });
      }
    });
  };

  const onExplorerSubmit = (values: ExplorerFormValues) => {
    setExploredCareers(null);
    startExplorerTransition(async () => {
      const result = await exploreCareerPaths({
        interests: values.interests,
        skills: values.skills,
        goals: values.goals || 'Not specified',
        academicBackground: values.academicBackground || 'Not specified'
      });
      if(result) {
        setExploredCareers(result);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not explore career paths. Please try again.',
        });
      }
    });
  }

  const handleSelectCareer = (career: string) => {
    setSelectedCareer(career);
    setSkillGaps(null);
    setRoadmap(null);

    startGapsTransition(async () => {
      if (!profile) return;
      const result = await analyzeSkillGaps({ careerPath: career, studentSkills: profile.skills.split(',').map(s => s.trim()) });
      if (result) {
        setSkillGaps(result);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not analyze skill gaps. Please try again.',
        });
      }
    });
  };

  const handleGenerateRoadmap = () => {
    startRoadmapTransition(async () => {
      if (!profile || !selectedCareer || !skillGaps) return;

      const fullProfile = `Academic Background: ${profile.academicBackground}, Interests: ${profile.interests}, Goals: ${profile.goals}, Learning Style: ${profile.learningStyle}`;
      const gaps = `Technical: ${skillGaps.missingTechnicalSkills.join(', ') || 'None'}. Soft Skills: ${skillGaps.missingSoftSkills.join(', ') || 'None'}.`;

      const result = await generateRoadmap({
        studentProfile: fullProfile,
        careerPath: selectedCareer,
        currentSkills: profile.skills,
        skillGaps: gaps
      });

      if (result) {
        setRoadmap(result);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate a roadmap. Please try again.',
        });
      }
    });
  };

  const Section: FC<{ icon: React.ReactNode, title: string, description: string, children: React.ReactNode, step?: number, className?: string }> = ({ icon, title, description, children, step, className }) => (
    <div className={cn("flex gap-6 md:gap-8", className)}>
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">{icon}</div>
        <div className="flex-grow w-px bg-border my-4"></div>
      </div>
      <div className="flex-1 pb-12">
        {step && <p className="text-sm font-semibold text-primary mb-1">STEP {step}</p>}
        <h2 className="text-3xl font-bold tracking-tight mb-2 font-headline">{title}</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">{description}</p>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold font-headline">NextStep</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto py-12 md:py-16 px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tighter font-headline">Your Personalized AI Co-Pilot</h1>
            <p className="text-muted-foreground text-center mt-4 text-lg md:text-xl max-w-3xl mx-auto">Navigate your future with confidence. Let's build your roadmap to success, one step at a time.</p>
          </div>
          
          <Tabs defaultValue="college" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="school">For School Students</TabsTrigger>
              <TabsTrigger value="college">For College Students</TabsTrigger>
            </TabsList>

            <TabsContent value="school" className="mt-8">
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
              
              {isSchoolRoadmapPending && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

              {schoolRoadmap && (
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
              )}
            </TabsContent>

            <TabsContent value="college" className="mt-8">
              <Tabs defaultValue="my-path" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="my-path">My Career Path</TabsTrigger>
                  <TabsTrigger value="explore">Explore Careers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="my-path" className="mt-8">
                  <React.Fragment>
                    <Section icon={<GraduationCap />} title="Build Your Profile" description="Tell us about yourself so our AI can understand your unique strengths and aspirations." step={1}>
                      <Card>
                        <CardContent className="pt-6">
                          <Form {...profileForm}>
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                              <FormField control={profileForm.control} name="academicBackground" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Academic Background</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="e.g., Bachelor's in Computer Science from..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={profileForm.control} name="interests" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Interests</FormLabel>
                                    <FormControl><Input placeholder="e.g., AI, mobile development, design" {...field} /></FormControl>
                                    <FormDescription>Separate interests with commas.</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={profileForm.control} name="skills" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Current Skills</FormLabel>
                                    <FormControl><Input placeholder="e.g., Python, React, Figma" {...field} /></FormControl>
                                    <FormDescription>Separate skills with commas.</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </div>
                              <FormField control={profileForm.control} name="goals" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Career Goals</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="What do you want to achieve in your career?" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={profileForm.control} name="learningStyle" render={({ field }) => (
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
                              <Button type="submit" size="lg" disabled={isRecsPending} className="w-full">
                                {isRecsPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><BrainCircuit className="mr-2" /> Get AI Recommendations</>}
                              </Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </Section>
                      
                    {isRecsPending && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

                    {recommendations && (
                      <Section icon={<Compass />} title="Choose Your Path" description="Here are some career paths that align with your profile. Select one to explore further." step={2}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {recommendations.careerOptions.map((career) => (
                            <Button key={career} variant={selectedCareer === career ? "default" : "outline"} className="h-auto p-4 flex flex-col items-start justify-start text-left rounded-lg" onClick={() => handleSelectCareer(career)} disabled={isGapsPending}>
                              <Briefcase className="w-6 h-6 mb-2"/>
                              <span className="font-semibold text-base whitespace-normal">{career}</span>
                              {isGapsPending && selectedCareer === career && <Loader2 className="h-4 w-4 animate-spin ml-auto mt-2" />}
                            </Button>
                          ))}
                        </div>
                      </Section>
                    )}

                    {isGapsPending && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

                    {skillGaps && selectedCareer && (
                      <Section icon={<Target />} title="Analyze Your Skill Gaps" description={`For a career in ${selectedCareer}, here are the skills you should focus on developing.`} step={3}>
                        <Card>
                          <CardContent className="pt-6 grid md:grid-cols-2 gap-8">
                            <div>
                              <h3 className="font-semibold text-xl mb-4">Technical Skills to Learn</h3>
                              {skillGaps.missingTechnicalSkills.length > 0 ? (
                                <ul className="space-y-3">{skillGaps.missingTechnicalSkills.map(skill => <li key={skill} className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span>{skill}</span></li>)}</ul>
                              ) : <p className="text-muted-foreground">No specific technical skill gaps identified. Great job!</p>}
                            </div>
                            <div>
                              <h3 className="font-semibold text-xl mb-4">Soft Skills to Develop</h3>
                              {skillGaps.missingSoftSkills.length > 0 ? (
                                <ul className="space-y-3">{skillGaps.missingSoftSkills.map(skill => <li key={skill} className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span>{skill}</span></li>)}</ul>
                              ) : <p className="text-muted-foreground">No specific soft skill gaps identified. Well done!</p>}
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button onClick={handleGenerateRoadmap} size="lg" disabled={isRoadmapPending} className="w-full">
                              {isRoadmapPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building Roadmap...</> : <><Route className="mr-2" /> Generate My Personalized Roadmap</>}
                            </Button>
                          </CardFooter>
                        </Card>
                      </Section>
                    )}

                    {isRoadmapPending && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

                    {roadmap && selectedCareer && (
                      <Section icon={<ListTodo />} title="Your Personalized Roadmap" description="Here is your visual flowchart and detailed plan. Expand each month to see the specific tasks." step={4}>
                        <Flowchart
                          title={`Roadmap to ${selectedCareer}`}
                          description="A monthly guide to your success."
                          milestones={roadmap.milestones.map(m => ({ label: `Month ${m.month}`, title: m.title, tasks: m.tasks }))}
                        />
                        <Accordion type="single" collapsible className="w-full mt-4">
                          {roadmap.milestones.map((milestone) => (
                            <AccordionItem key={milestone.month} value={`item-${milestone.month}`}>
                              <AccordionTrigger className="text-lg">Month {milestone.month}: {milestone.title}</AccordionTrigger>
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
                    )}
                  </React.Fragment>
                </TabsContent>

                <TabsContent value="explore" className="mt-8">
                  <React.Fragment>
                    <Section icon={<Compass />} title="Career Explorer" description="Not sure where to start? Enter some interests and skills to explore potential career paths.">
                      <Card>
                        <CardContent className="pt-6">
                          <Form {...explorerForm}>
                            <form onSubmit={explorerForm.handleSubmit(onExplorerSubmit)} className="space-y-6">
                              <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={explorerForm.control} name="interests" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Your Interests</FormLabel>
                                    <FormControl><Input placeholder="e.g., machine learning, data visualization" {...field} /></FormControl>
                                    <FormDescription>Separate with commas.</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={explorerForm.control} name="skills" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Your Skills</FormLabel>
                                    <FormControl><Input placeholder="e.g., Python, SQL, data analysis" {...field} /></FormControl>
                                    <FormDescription>Separate with commas.</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </div>
                              <FormField control={explorerForm.control} name="academicBackground" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Academic Background (Optional)</FormLabel>
                                  <FormControl><Input placeholder="e.g., B.Tech in Electronics" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={explorerForm.control} name="goals" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Career Goals (Optional)</FormLabel>
                                  <FormControl><Input placeholder="e.g., work in a FAANG company" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <Button type="submit" size="lg" disabled={isExplorerPending} className="w-full">
                                {isExplorerPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exploring...</> : <><Compass className="mr-2" /> Explore Careers</>}
                              </Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </Section>

                    {isExplorerPending && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

                    {exploredCareers && (
                      <Section icon={<ListTodo />} title="Exploration Results" description="Based on your input, here are some career paths and the skills you'd need to develop.">
                        <Card>
                          <CardContent className="space-y-6 pt-6">
                            {exploredCareers.careerPaths.map(path => (
                              <Alert key={path} className="[&>svg]:top-5">
                                <Briefcase className="h-5 w-5" />
                                <AlertTitle className="font-bold text-lg mb-2">{path}</AlertTitle>
                                <AlertDescription>
                                  <h4 className="font-semibold mb-2 text-foreground">Skill Requirements:</h4>
                                  {exploredCareers.skillRequirements[path]?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {exploredCareers.skillRequirements[path].map(skill => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                      ))}
                                    </div>
                                  ) : <p className="text-sm text-muted-foreground">You seem to have most skills for this path!</p>}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </CardContent>
                        </Card>
                      </Section>
                    )}
                  </React.Fragment>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="text-center p-6 text-sm text-muted-foreground border-t">
        <p>Powered by AI. Your future, clarified.</p>
      </footer>
    </div>
  );
}
