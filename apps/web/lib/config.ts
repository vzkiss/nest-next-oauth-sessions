export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  /** Canonical app URL when set (e.g. production). See .env.example for Vercel notes. */
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000',
};
