'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import { Button } from '../ui/button';

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isLoginView, setIsLoginView] = useState(true);

  const handleClose = () => {
    onOpenChange(false);
    // Reset to login view when dialog is closed
    setTimeout(() => setIsLoginView(true), 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold font-headline text-center">
            {isLoginView ? 'Login' : 'Sign Up'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isLoginView
              ? 'Enter your credentials to access your account.'
              : 'Create an account to get started.'}
          </DialogDescription>
        </DialogHeader>
        {isLoginView ? (
          <LoginForm onSignupClick={() => setIsLoginView(false)} onSuccess={handleClose} />
        ) : (
          <SignupForm onLoginClick={() => setIsLoginView(true)} onSuccess={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
