// setup config
export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
      ? parseInt(process.env.JWT_EXPIRES_IN, 10)
      : 604800, // 7 days in seconds (7 * 24 * 60 * 60)
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3000/auth/validate/google',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3001',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
});
