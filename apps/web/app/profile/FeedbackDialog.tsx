'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { apiFetch, ApiUnauthorizedError, ApiHttpError } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const feedbackSchema = z.object({
  message: z
    .string()
    .min(5, 'Feedback must be at least 5 characters')
    .max(1000, 'Feedback must be at most 1000 characters'),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function FeedbackDialog({ open, onClose }: Props) {
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { message: '' },
  });

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      onClose();
    }
  };

  const onSubmit = async (values: FeedbackFormValues) => {
    try {
      await apiFetch('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      toast.success('Thanks for your feedback!');
      onClose();
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onClose();
        return;
      }
      if (error instanceof ApiHttpError) {
        toast.error(`Could not send feedback (${error.status}). Try again.`);
        return;
      }
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              id="feedback-message"
              rows={4}
              placeholder="What's on your mind?"
              {...form.register('message')}
            />
            {form.formState.errors.message && (
              <p className="text-destructive mt-1 text-sm">
                {form.formState.errors.message.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex-1"
            >
              {form.formState.isSubmitting ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
