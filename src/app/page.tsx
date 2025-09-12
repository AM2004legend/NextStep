
'use client';
import React from 'react';
import { GraduationCap, School, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollegeStudentForm } from '@/components/CollegeStudentForm';
import { SchoolStudentForm } from '@/components/SchoolStudentForm';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Button } from '@/components/ui/button';

export default function Home() {
  
  const scrollToContent = () => {
    const content = document.getElementById('content');
    if (content) {
      content.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline">NextStep</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <div className="h-screen w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
          <div className="max-w-2xl mx-auto p-4 flex flex-col items-center">
            <div className="relative z-10 flex items-center justify-center mb-4">
              <Logo className="h-16 w-16 text-primary" />
            </div>
            <h1 className="relative z-10 text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-sans font-bold">
              NextStep
            </h1>
            <p className="text-neutral-400 max-w-lg mx-auto my-4 text-lg text-center relative z-10">
             Your Personalized AI Co-Pilot to navigate your future with confidence.
            </p>
            <Button size="lg" onClick={scrollToContent} className="relative z-10 mt-6">
              Get Started
              <ChevronDown className="ml-2 h-5 w-5"/>
            </Button>
          </div>
          <BackgroundBeams />
        </div>
        <div id="content" className="max-w-4xl mx-auto py-12 md:py-16 px-4">
          <Tabs defaultValue="college" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="school"><School className="mr-2 h-4 w-4"/>For School Students</TabsTrigger>
              <TabsTrigger value="college"><GraduationCap className="mr-2 h-4 w-4"/>For College Students / Graduates</TabsTrigger>
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
