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
      <div className="flex flex-col gap-16 md:gap-24 items-center">
        <HeroSection onAskQuestionClick={() => setIsQuestionDialogOpen(true)} />
        <HowItWorks onAskQuestionClick={() => setIsQuestionDialogOpen(true)} />
        <Features />
        <Lawyers />

        {/* 👇 Add this button to navigate to your chat page */}
        <a
          href="/chat.html"
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200"
        >
          Go to Chat
        </a>
      </div>

      <AskQuestionDialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen} />
    </>
  );
}
