export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  session: {
    secret: process.env.SESSION_SECRET,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3000/auth/validate/google',
  },
  client: {
    /** Public origin of the Next.js app (CORS + OAuth redirect after login). */
    origin: process.env.CLIENT_ORIGIN,
  },
  nodeEnv: process.env.NODE_ENV || 'development',
});
