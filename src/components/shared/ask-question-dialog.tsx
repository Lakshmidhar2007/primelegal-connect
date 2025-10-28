'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AskQuestionForm } from './ask-question-form';

type AskQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AskQuestionDialog({ open, onOpenChange }: AskQuestionDialogProps) {

  const handleClose = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold font-headline text-center">
            Ask a Question
          </DialogTitle>
        </DialogHeader>
        <AskQuestionForm onSuccess={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
