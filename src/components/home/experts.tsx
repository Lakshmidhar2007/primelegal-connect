import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const expertsData = [
  {
    name: 'Eleanor Vance',
    specialty: 'Corporate Law',
    image: PlaceHolderImages.find(p => p.id === 'expert1'),
  },
  {
    name: 'Marcus Thorne',
    specialty: 'Family Law',
    image: PlaceHolderImages.find(p => p.id === 'expert2'),
  },
  {
    name: 'Isabella Rossi',
    specialty: 'Intellectual Property',
    image: PlaceHolderImages.find(p => p.id === 'expert3'),
  },
  {
    name: 'Julian Croft',
    specialty: 'Criminal Defense',
    image: PlaceHolderImages.find(p => p.id === 'expert4'),
  },
];

export function Experts() {
  return (
    <section className="container py-12 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-4xl md:text-5xl">
          Meet Our Legal Experts
        </h2>
        <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
          A curated network of experienced professionals ready to assist you.
        </p>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {expertsData.map((expert) => (
          <Card key={expert.name} className="overflow-hidden text-center">
            <CardHeader className="p-0">
              {expert.image && (
                <Image
                  src={expert.image.imageUrl}
                  alt={`Portrait of ${expert.name}`}
                  width={400}
                  height={400}
                  className="aspect-square object-cover w-full"
                  data-ai-hint={expert.image.imageHint}
                />
              )}
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="font-headline text-xl">{expert.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{expert.specialty}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full">Connect</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
