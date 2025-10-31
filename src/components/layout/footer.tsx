'use client';
import { Logo } from "@/components/icons/logo";
import { Button } from "../ui/button";
import { Phone } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="mt-16 border-t">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {currentYear} {t('PrimeLegal CONNECT')}. {t('All rights reserved.')}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Button asChild variant="outline" size="sm">
                <a href="tel:9488877543">
                    <Phone className="mr-2" />
                    {t('Contact Support')}
                </a>
            </Button>
            <p className="max-w-md text-center text-xs text-muted-foreground">
              {t('Disclaimer: The information provided by our AI and legal experts is for informational purposes only and does not constitute legal advice.')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
