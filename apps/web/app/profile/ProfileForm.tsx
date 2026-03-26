'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../context/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { config } from '../../lib/config';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

const DEFAULT_AVATAR = '/avatar.png';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  image: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .refine((v) => v === null || /^https?:\/\//.test(v), 'Must be a valid URL'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type Props = {
  user: AuthUser;
};

export function ProfileForm({ user }: Props) {
  const { fetchUser } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      image: user.image ?? '',
    },
  });

  // Keep form in sync with auth state
  useEffect(() => {
    form.reset({
      name: user.name,
      image: user.image ?? '',
    });
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const response = await fetch(`${config.apiUrl}/user/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          image: values.image,
        }),
      });

      if (!response.ok) {
        toast.error(`Profile update failed: ${response.status}`);
      }

      await fetchUser();

      toast.success('Profile updated successfully');
    } catch {
      // console.error('Profile update error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const imageValue = form.watch('image') || DEFAULT_AVATAR;

  return (
    <div className="bg-surface space-y-4 rounded-3xl p-6 shadow-xs">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageValue}
        alt={user.name}
        className="mx-auto h-20 w-20 rounded-full"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_AVATAR;
        }}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-foreground-muted block text-sm font-medium">
            Email
          </label>
          <p className="text-foreground mt-1">{user.email}</p>
        </div>

        <Input
          label="Name"
          error={form.formState.errors.name?.message}
          {...form.register('name')}
        />

        <div>
          <div className="relative">
            <Input
              label="Avatar URL"
              error={form.formState.errors.image?.message}
              className="pr-10"
              {...form.register('image')}
            />

            {form.watch('image') && (
              <button
                type="button"
                onClick={() =>
                  form.setValue('image', null, { shouldDirty: true })
                }
                className="text-foreground-subtle hover:text-foreground-muted absolute top-8 right-3 flex cursor-pointer items-center"
                aria-label="Clear avatar URL"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          Save changes
        </Button>
      </form>
    </div>
  );
}
