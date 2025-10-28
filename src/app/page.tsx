'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/home/hero-section';
import { HowItWorks } from '@/components/home/how-it-works';
import { Features } from '@/components/home/features';
import { Lawyers } from '@/components/home/lawyers';
import { AskQuestionDialog } from '@/components/shared/ask-question-dialog';

export default function Home() {
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  
  return (
    <>
      <div className="flex flex-col gap-16 md:gap-24">
        <HeroSection onAskQuestionClick={() => setIsQuestionDialogOpen(true)} />
        <HowItWorks onAskQuestionClick={() => setIsQuestionDialogOpen(true)} />
        <Features />
        <Lawyers />
      </div>
      <AskQuestionDialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen} />
    </>
  );
}
