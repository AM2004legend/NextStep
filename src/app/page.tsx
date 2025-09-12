
'use client';
import React from 'react';
import { GraduationCap, School } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollegeStudentForm } from '@/components/CollegeStudentForm';
import { SchoolStudentForm } from '@/components/SchoolStudentForm';
import { BackgroundBeams } from '@/components/ui/background-beams';

export default function Home() {
  
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
      <div className="relative flex flex-col items-center justify-center antialiased bg-background text-center py-24 md:py-32">
          <div className="max-w-4xl mx-auto p-4 flex flex-col items-center">
            <h1 className="relative z-10 text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 font-sans font-bold">
              Your Personalized AI Co-Pilot
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto my-4 text-lg text-center relative z-10">
              Navigate your future with confidence. Let's build your roadmap to success, one step at a time.
            </p>
          </div>
          <BackgroundBeams />
        </div>
        <div id="content" className="max-w-4xl mx-auto pb-12 md:pb-16 px-4 -mt-16 relative z-10">
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
