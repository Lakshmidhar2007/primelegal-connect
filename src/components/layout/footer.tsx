'use client';
import { useState } from 'react';
import { Logo } from "@/components/icons/logo";
import { Button } from "../ui/button";
import { Phone, Building, Mail } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '../ui/separator';

export function Footer() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <>
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
              <Button onClick={() => setIsContactOpen(true)} variant="outline" size="sm">
                  <Phone className="mr-2" />
                  {t('Contact Support')}
              </Button>
              <p className="max-w-md text-center text-xs text-muted-foreground">
                {t('Disclaimer: The information provided by our AI and legal experts is for informational purposes only and does not constitute legal advice.')}
              </p>
            </div>
          </div>
        </div>
      </footer>
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{t('Contact Information')}</DialogTitle>
            <DialogDescription>
              {t('You can reach out to us using the details below.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Logo className="h-5 w-5"/>
                </div>
                <div>
                    <p className="font-semibold">{t('PrimeLegal CONNECT')}</p>
                    <p className="text-sm text-muted-foreground">{t('Website')}</p>
                </div>
            </div>
             <Separator />
             <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Mail className="h-5 w-5"/>
                </div>
                <div>
                    <p className="font-semibold">primelegalconnect@gmail.com</p>
                    <p className="text-sm text-muted-foreground">{t('Email')}</p>
                </div>
            </div>
            <Separator />
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full mt-1">
                    <Phone className="h-5 w-5"/>
                </div>
                <div>
                    <p className="font-semibold">8247444865, 8122846046, 9894139729</p>
                    <p className="text-sm text-muted-foreground">{t('Phone Numbers')}</p>
                </div>
            </div>
             <Separator />
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Building className="h-5 w-5"/>
                </div>
                <div>
                    <p className="font-semibold">{t('kanchipuram,chennai')}</p>
                    <p className="text-sm text-muted-foreground">{t('Address')}</p>
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
