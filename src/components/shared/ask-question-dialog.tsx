'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AskQuestionForm } from './ask-question-form';
import { useTranslation } from '@/hooks/use-translation';

type AskQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lawyerId?: string;
};

export function AskQuestionDialog({ open, onOpenChange, lawyerId }: AskQuestionDialogProps) {
  const { t } = useTranslation();
  const handleClose = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold font-headline text-center">
            {t('Contact Lawyer')}
          </DialogTitle>
        </DialogHeader>
        <AskQuestionForm onSuccess={handleClose} lawyerId={lawyerId} />
      </DialogContent>
    </Dialog>
  );
}
