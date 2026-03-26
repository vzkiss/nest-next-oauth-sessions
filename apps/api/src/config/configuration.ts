function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, '');
}

export default () => {
  const apiOrigin = process.env.API_ORIGIN
    ? stripTrailingSlash(process.env.API_ORIGIN)
    : undefined;

  const googleCallbackUrl =
    process.env.GOOGLE_CALLBACK_URL ||
    (apiOrigin ? `${apiOrigin}/auth/validate/google` : undefined);

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      url: process.env.DATABASE_URL,
    },
    session: {
      secret: process.env.SESSION_SECRET,
    },
    api: {
      /** Public base URL of this API (scheme + host + port, no trailing slash). */
      origin: apiOrigin,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: googleCallbackUrl,
    },
    client: {
      /** Public origin of the Next.js app (CORS + OAuth redirect after login). */
      origin: process.env.CLIENT_ORIGIN,
    },
    nodeEnv: process.env.NODE_ENV || 'development',
  };
};
