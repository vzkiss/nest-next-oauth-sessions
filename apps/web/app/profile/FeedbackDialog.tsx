'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { config } from '../../lib/config';
import { Dialog } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

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

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const onSubmit = async (values: FeedbackFormValues) => {
    try {
      const response = await fetch(`${config.apiUrl}/feedback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success('Thanks for your feedback!');
      onClose();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Send Feedback">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Textarea
          id="feedback-message"
          rows={4}
          placeholder="What's on your mind?"
          error={form.formState.errors.message?.message}
          {...form.register('message')}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
    </Dialog>
  );
}
