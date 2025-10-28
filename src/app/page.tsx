import { HeroSection } from '@/components/home/hero-section';
import { HowItWorks } from '@/components/home/how-it-works';
import { Features } from '@/components/home/features';
import { Experts } from '@/components/home/experts';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1541336028-912853587905?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3"
          alt="Courthouse background"
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-20"
          data-ai-hint="courthouse building"
          priority
        />
        <div className="absolute inset-0 bg-background/80 bg-gradient-to-b from-background/50 via-background/90 to-background"></div>
      </div>
      <div className="relative z-10 flex flex-col gap-16 md:gap-24">
        <HeroSection />
        <HowItWorks />
        <Features />
        <Experts />
      </div>
    </div>
  );
}
