'use client';

import { useForm } from 'react-hook-form';
import { useAuth } from '@/app/context/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch, ApiUnauthorizedError, ApiHttpError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { UpdateUserDto, UserDto } from '@repo/dto';

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

const DEFAULT_AVATAR = '/avatar.png';

function ProfileForm() {
  const { user, updateUser } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      image: user?.image ?? '',
    },
  });

  const watchedImage = form.watch('image');
  const watchedName = form.watch('name');
  const previewSrc =
    watchedImage == null || String(watchedImage).trim() === ''
      ? DEFAULT_AVATAR
      : String(watchedImage).trim();
  const previewAlt =
    String(watchedName ?? user?.name ?? '').trim() || 'Profile';

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const response = await apiFetch('/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(values satisfies UpdateUserDto) }),
      });

      if (!response.ok) {
        toast.error('Failed to update profile');
        return;
      }

      const data: UserDto = await response.json();
      updateUser(data);

      toast.success('Profile updated successfully');
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        return;
      }
      if (error instanceof ApiHttpError) {
        toast.error(`Profile update failed: ${error.status}`);
        return;
      }
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <Card className="rounded-3xl p-6 shadow-xs">
      {/* eslint-disable-next-line @next/next/no-img-element -- external / user-supplied URLs */}
      <CardHeader>
        <img
          src={previewSrc}
          alt={previewAlt}
          className="mx-auto h-20 w-20 rounded-full"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
        />
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Email</Label>
            <p className="text-foreground mt-1">{user?.email}</p>
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" className="mt-1" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-destructive mt-1 text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="image">Avatar URL</Label>
            <InputGroup className="mt-1">
              <InputGroupInput id="image" {...form.register('image')} />
              {watchedImage != null && String(watchedImage).trim() !== '' && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() =>
                      form.setValue('image', null, { shouldDirty: true })
                    }
                    aria-label="Clear avatar URL"
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            {form.formState.errors.image && (
              <p className="text-destructive mt-1 text-sm">
                {form.formState.errors.image.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export { ProfileForm };
