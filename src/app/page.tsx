
'use client';
import React from 'react';
import { GraduationCap, School } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CollegeStudentForm } from '@/components/CollegeStudentForm';
import { SchoolStudentForm } from '@/components/SchoolStudentForm';
import { PointerHighlight } from '@/components/ui/pointer-highlight';

export default function Home() {
  const scrollToContent = () => {
    const content = document.getElementById('content');
    if (content) {
      content.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline"><PointerHighlight>NextStep</PointerHighlight></h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <div className="text-center pt-24 md:pt-32 pb-12 md:pb-16">
          <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground font-headline">
              Your <PointerHighlight><span>Personalized</span></PointerHighlight> AI Career Co-Pilot
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-lg">
              Navigate your future with confidence. Let's build your roadmap to success, one step at a time.
            </p>
            <div className="mt-8">
              <Button size="lg" onClick={scrollToContent}>Get Started</Button>
            </div>
          </div>
        </div>

        <div id="content" className="max-w-4xl mx-auto pb-12 md:pb-16 px-4">
          <Tabs defaultValue="college" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="school" className="whitespace-normal"><School className="mr-2 h-4 w-4"/>For School Students</TabsTrigger>
              <TabsTrigger value="college" className="whitespace-normal"><GraduationCap className="mr-2 h-4 w-4"/>For College Students / Graduates</TabsTrigger>
            </TabsList>

            <TabsContent value="school" className="mt-8">
              <SchoolStudentForm />
            </TabsContent>

            <TabsContent value="college" className="mt-8">
                <CollegeStudentForm />
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
