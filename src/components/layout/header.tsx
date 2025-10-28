'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/icons/logo';
import { useState, useEffect } from 'react';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { ModeToggle } from '../mode-toggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/case-tracking', label: 'Track Case' },
  { href: '/submit-documents', label: 'File a case' },
];

export function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isLawyer, setIsLawyer] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (firestore && user) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [firestore, user]);

  const { data: userProfile } = useDoc<{ isLawyer: boolean }>(userDocRef);

  useEffect(() => {
    if (userProfile) {
      setIsLawyer(userProfile.isLawyer);
    } else {
      setIsLawyer(false);
    }
  }, [userProfile]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const allNavLinks = [...navLinks];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold font-headline text-lg">
              PRIMELEGAL CONNECT
            </span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {allNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ModeToggle />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-10">
              <Link href="/" className="mb-8 flex items-center" onClick={() => setIsSheetOpen(false)}>
                <Logo className="mr-2 h-6 w-6 text-primary" />
                <span className="font-bold font-headline text-lg">
                  PRIMELEGAL CONNECT
                </span>
              </Link>
              <nav className="flex flex-col space-y-4">
                {allNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsSheetOpen(false)}
                    className="text-lg font-medium text-foreground/80 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                  {isLawyer && (
                    <Link
                      href='/lawyer-dashboard'
                      onClick={() => setIsSheetOpen(false)}
                      className="text-lg font-medium text-foreground/80 hover:text-foreground"
                    >
                      Lawyer Dashboard
                    </Link>
                  )}
              </nav>
            </SheetContent>
          </Sheet>
          {isUserLoading ? null : user ? (
            <div className="flex items-center gap-2">
                 {isLawyer && (
                    <Button asChild variant="outline" size="sm">
                        <Link href="/lawyer-dashboard">Lawyer Dashboard</Link>
                    </Button>
                )}
              <Button asChild variant="ghost" size="icon">
                <Link href="/profile">
                  <User />
                  <span className="sr-only">Profile</span>
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="hidden md:flex bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
