function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, '');
}

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  session: {
    secret: process.env.SESSION_SECRET,
  },
  api: {
    /** Public base URL of this API (scheme + host + port, no trailing slash). */
    origin: process.env.API_ORIGIN
      ? stripTrailingSlash(process.env.API_ORIGIN)
      : undefined,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    /** Full OAuth redirect URI — must match Google Console and the API route that handles the callback. */
    callbackUrl: process.env.GOOGLE_CALLBACK_URL?.trim() || undefined,
  },
  client: {
    /** Public origin of the Next.js app (CORS + OAuth redirect after login). */
    origin: process.env.CLIENT_ORIGIN,
  },
  nodeEnv: process.env.NODE_ENV || 'development',
});
