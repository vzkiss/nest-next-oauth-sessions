'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../context/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const DEFAULT_AVATAR = '/avatar.png';

// basic form data validation
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
    const res = await fetch('http://localhost:3000/user/profile', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        image: values.image,
      }),
    });

    if (res.ok) {
      await fetchUser();
    }
  };

  const imageValue = form.watch('image') || DEFAULT_AVATAR;

  return (
    <div className="space-y-4 rounded-3xl bg-white p-6 shadow-xs">
      <img
        src={imageValue}
        alt={user.name}
        className="mx-auto h-20 w-20 rounded-full"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_AVATAR;
        }}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Email (read-only, not part of form schema) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <p className="mt-1 text-gray-900">{user.email}</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            {...form.register('name')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Avatar URL
          </label>

          <div className="relative mt-1">
            <input
              {...form.register('image')}
              placeholder="https://example.com/avatar.jpg"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
            />

            {form.watch('image') && (
              <button
                type="button"
                onClick={() =>
                  form.setValue('image', null, { shouldDirty: true })
                }
                className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear avatar URL"
              >
                ✕
              </button>
            )}
          </div>

          {form.formState.errors.image && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.image.message}
            </p>
          )}
        </div>

        {/* Action */}
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-full bg-black px-6 py-3 text-white hover:bg-black/80 disabled:opacity-50"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
