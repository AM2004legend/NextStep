
'use client';
import React, { useState, useTransition, type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Briefcase, Target, GraduationCap, Lightbulb, BookOpen, ChevronRight, Loader2, Compass, CheckCircle2, ListTodo, Route, School, Music, PlayCircle, PauseCircle, Square, Volume2, Library } from 'lucide-react';
import { careerPathRecommendation, type CareerPathRecommendationOutput } from '@/ai/flows/career-path-recommendation';
import { analyzeSkillGaps, type AnalyzeSkillGapsOutput } from '@/ai/flows/skill-gap-analysis';
import { generateRoadmap, type GenerateRoadmapOutput } from '@/ai/flows/personalized-roadmap-generation';
import { exploreCareerPaths, type CareerPathExplorationOutput } from '@/ai/flows/career-path-exploration';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PointerHighlight } from './ui/pointer-highlight';
import { CollegeSuggester } from './CollegeSuggester';
import { CompanySuggester } from './CompanySuggester';

const profileFormSchema = z.object({
  academicBackground: z.string().min(10, 'Please provide more details.'),
  interests: z.string().min(3, 'Please list at least one interest.'),
  skills: z.string().min(3, 'Please list at least one skill.'),
  goals: z.string().min(10, 'Please describe your career goals.'),
  learningStyle: z.enum(['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic']),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


const explorerFormSchema = z.object({
  interests: z.string().min(3, { message: "Please enter at least one interest." }),
  skills: z.string().min(3, { message: "Please enter at least one skill." }),
  goals: z.string().optional(),
  academicBackground: z.string().optional(),
});

type ExplorerFormValues = z.infer<typeof explorerFormSchema>;

interface FlowchartProps {
  milestones: GenerateRoadmapOutput['milestones'];
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
                <AccordionItem value={`item-${index}`} key={milestone.month} className="border-b-0">
                    <AccordionTrigger className="p-4 bg-primary/5 hover:bg-primary/10 rounded-lg justify-between">
                        <div className="flex items-center gap-4 text-left">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">{milestone.month}</div>
                            <div className="flex flex-col">
                                <span className='font-bold text-base text-left'>{milestone.title}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); speak(`Month ${milestone.month}: ${milestone.title}. Tasks: ${milestone.tasks.join('. ')}`, `month-${milestone.month}`)}}>
                            {speakingId === `month-${milestone.month}` ? <PauseCircle /> : <PlayCircle />}
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


export const CollegeStudentForm: FC = () => {
    const { toast } = useToast();
    const [isRecsPending, startRecsTransition] = useTransition();
    const [isGapsPending, startGapsTransition] = useTransition();
    const [isRoadmapPending, startRoadmapTransition] = useTransition();
    const [isExplorerPending, startExplorerTransition] = useTransition();
  
    const [recommendations, setRecommendations] = useState<CareerPathRecommendationOutput | null>(null);
    const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
    const [skillGaps, setSkillGaps] = useState<AnalyzeSkillGapsOutput | null>(null);
    const [roadmap, setRoadmap] = useState<GenerateRoadmapOutput | null>(null);
    const [profile, setProfile] = useState<ProfileFormValues | null>(null);
    
    const [exploredCareers, setExploredCareers] = useState<CareerPathExplorationOutput | null>(null);
    
    useEffect(() => {
        return () => {
          // Cleanup speech synthesis on component unmount
          if (typeof window !== 'undefined' && ('speechSynthesis' in window)) {
            window.speechSynthesis.cancel();
          }
        };
      }, []);

  
    const profileForm = useForm<ProfileFormValues>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: { academicBackground: '', interests: '', skills: '', goals: '', learningStyle: 'Visual' },
    });
  
    const explorerForm = useForm<ExplorerFormValues>({
      resolver: zodResolver(explorerFormSchema),
      defaultValues: { interests: '', skills: '', goals: '', academicBackground: '' },
    });
    
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
  
        const fullProfile = `Academic Background: ${profile.academicBackground}, Interests: ${profile.interests}, Goals: ${profile.goals}`;
        const gaps = `Technical: ${skillGaps.missingTechnicalSkills.join(', ') || 'None'}. Soft Skills: ${skillGaps.missingSoftSkills.join(', ') || 'None'}.`;
  
        const result = await generateRoadmap({
          studentProfile: fullProfile,
          careerPath: selectedCareer,
          currentSkills: profile.skills,
          skillGaps: gaps,
          learningStyle: profile.learningStyle
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
  
    const renderSection = (icon: React.ReactNode, title: string, description: string, step: number, children: React.ReactNode) => (
      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">{icon}</div>
          <div className="flex-grow w-px bg-border my-4"></div>
        </div>
        <div className="flex-1 pb-12">
          <div className="text-sm font-semibold text-primary mb-1">STEP {step}</div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 font-headline"><PointerHighlight>{title}</PointerHighlight></h2>
          <div className="text-muted-foreground mb-6 max-w-2xl">{description}</div>
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    );
  
    const renderCollegeRecommendations = () => {
      if (isRecsPending) {
        return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
      }
    
      if (recommendations) {
        return renderSection(<Compass />, "Choose Your Path", "Here are some career paths that align with your profile. Select one to explore further.", 2,
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.careerOptions.map((career) => (
              <Button key={career} variant={selectedCareer === career ? "default" : "outline"} className="h-auto p-4 flex flex-col items-start justify-start text-left rounded-lg" onClick={() => handleSelectCareer(career)} disabled={isGapsPending}>
                <Briefcase className="w-6 h-6 mb-2"/>
                <span className="font-semibold text-base whitespace-normal">{career}</span>
                {isGapsPending && selectedCareer === career && <Loader2 className="h-4 w-4 animate-spin ml-auto mt-2" />}
              </Button>
            ))}
          </div>
        );
      }
    
      return null;
    };
    
    const renderSkillGaps = () => {
      if (isGapsPending) {
        return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
      }
    
      if (skillGaps && selectedCareer) {
        return renderSection(<Target />, "Analyze Your Skill Gaps", `For a career in ${selectedCareer}, here are the skills you should focus on developing.`, 3,
          <Card>
            <CardContent className="pt-6 grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-xl mb-4"><PointerHighlight>Technical Skills to Learn</PointerHighlight></h3>
                {skillGaps.missingTechnicalSkills.length > 0 ? (
                  <ul className="space-y-3">{skillGaps.missingTechnicalSkills.map(skill => <li key={skill} className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span>{skill}</span></li>)}</ul>
                ) : <p className="text-muted-foreground">No specific technical skill gaps identified. Great job!</p>}
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-4"><PointerHighlight>Soft Skills to Develop</PointerHighlight></h3>
                {skillGaps.missingSoftSkills.length > 0 ? (
                  <ul className="space-y-3">{skillGaps.missingSoftSkills.map(skill => <li key={skill} className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><span>{skill}</span></li>)}</ul>
                ) : <p className="text-muted-foreground">No specific soft skill gaps identified. Well done!</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerateRoadmap} size="lg" disabled={isRoadmapPending} className="w-full">
                {isRoadmapPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building Your Plan...</> : <><Route className="mr-2" /> Generate My Personalized Plan</>}
              </Button>
            </CardFooter>
          </Card>
        );
      }
    
      return null;
    };
  
    const renderCollegeRoadmap = () => {
      if (isRoadmapPending) {
        return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
      }
    
      if (roadmap && selectedCareer && profile) {
        return renderSection(<ListTodo />, "Your Personalized Roadmap", "Here is your actionable plan to becoming a successful " + selectedCareer, 4,
          <Flowchart milestones={roadmap.milestones} title={`Roadmap to ${selectedCareer}`} />
        );
      }
    
      return null;
    };
    
    const renderExplorerResults = () => {
      if (isExplorerPending) {
          return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
      }
        
      if(exploredCareers) {
          return (
              renderSection(<ListTodo />, "Exploration Results", "Based on your input, here are some career paths and the skills you'd need to develop.", 2, 
                <Card>
                  <CardContent className="space-y-6 pt-6">
                    {exploredCareers.recommendations.map(rec => (
                      <Alert key={rec.careerPath} className="[&>svg]:top-5">
                        <Briefcase className="h-5 w-5" />
                        <AlertTitle className="font-bold text-lg mb-2"><PointerHighlight>{rec.careerPath}</PointerHighlight></AlertTitle>
                        <AlertDescription>
                          <h4 className="font-semibold mb-2 text-foreground"><PointerHighlight>Skill Requirements:</PointerHighlight></h4>
                          {rec.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {rec.skills.map(skill => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          ) : <p className="text-sm text-muted-foreground">You seem to have most skills for this path!</p>}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )
          )
      }
  
      return null;
    }

    return (
        <Tabs defaultValue="my-path" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="my-path"><BrainCircuit className="mr-2 h-4 w-4"/>My Career Path</TabsTrigger>
                <TabsTrigger value="explore"><Compass className="mr-2 h-4 w-4"/>Explore Careers</TabsTrigger>
                <TabsTrigger value="resources"><Library className="mr-2 h-4 w-4"/>Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-path" className="mt-8">
                {renderSection(<GraduationCap />, "Build Your Profile", "Tell us about yourself so our AI can understand your unique strengths and aspirations.", 1,
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
                )}
                
                {recommendations && renderCollegeRecommendations()}
                {skillGaps && renderSkillGaps()}
                {roadmap && renderCollegeRoadmap()}

            </TabsContent>

            <TabsContent value="explore" className="mt-8">
                {renderSection(<Compass />, "Career Explorer", "Not sure where to start? Enter some interests and skills to explore potential career paths.", 1, 
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
                )}

                {renderExplorerResults()}
            </TabsContent>
            <TabsContent value="resources" className="mt-8">
                <div className="space-y-8">
                    <CollegeSuggester />
                    <CompanySuggester />
                </div>
            </TabsContent>
        </Tabs>
    )
}

    

    