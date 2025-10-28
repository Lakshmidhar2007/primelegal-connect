type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="space-y-2 text-center">
      <h1 className="text-4xl font-bold tracking-tighter font-headline sm:text-5xl md:text-6xl">
        {title}
      </h1>
      <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
        {subtitle}
      </p>
    </div>
  );
}
