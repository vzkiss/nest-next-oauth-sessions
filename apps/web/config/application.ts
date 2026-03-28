/** Env-backed app settings (Next public vars + defaults). */
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
} as const;
