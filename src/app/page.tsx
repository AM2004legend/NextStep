
'use client';
import React from 'react';
import { motion } from 'framer-motion';
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
       <header className="p-4 bg-background fixed top-0 w-full z-20 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <Logo className="w-8 h-8 text-primary group-hover:text-foreground transition-colors" />
            <span className="text-xl font-bold text-foreground">NextStep</span>
          </a>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <div className="text-center pt-24 md:pt-32 pb-12 md:pb-16">
          <div className="max-w-4xl mx-auto p-4">
            <motion.div
              initial={{ opacity: 0.8, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold text-primary font-headline tracking-tighter">
                NextStep
              </h1>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground font-headline mt-6">
              <PointerHighlight>Your Personalized AI Career Co-Pilot</PointerHighlight>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-lg">
              Navigate your future with confidence. Let's build your roadmap to success, one step at a time.
            </p>
            <div className="mt-8">
              <Button size="lg" onClick={scrollToContent} className="font-headline font-bold">Get Started</Button>
            </div>
          </div>
        </div>

        <div id="content" className="max-w-4xl mx-auto pb-12 md:pb-16 px-4">
          <Tabs defaultValue="college" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto bg-primary/10 text-primary">
              <TabsTrigger value="school" className="whitespace-normal data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground"><School className="mr-2 h-4 w-4"/>For School Students</TabsTrigger>
              <TabsTrigger value="college" className="whitespace-normal data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground"><GraduationCap className="mr-2 h-4 w-4"/>For College Students / Graduates</TabsTrigger>
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
