import { HeroSection } from '@/components/home/hero-section';
import { HowItWorks } from '@/components/home/how-it-works';
import { Features } from '@/components/home/features';
import { Experts } from '@/components/home/experts';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24">
      <HeroSection />
      <HowItWorks />
      <Features />
      <Experts />
    </div>
  );
}
