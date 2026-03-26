import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/app/context/AuthContext';
import type { AuthUser } from '@/app/context/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { config } from '@/lib/config';
import { Button } from '@/components/ui/button';
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

function ProfileForm({ user }: { user: AuthUser }) {
  const { fetchUser } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      image: user.image ?? '',
    },
  });

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
        return;
      }

      await fetchUser();
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Email</Label>
        <p className="text-foreground mt-1">{user.email}</p>
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
          {form.watch('image') && (
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
  );
}

export { ProfileForm };
