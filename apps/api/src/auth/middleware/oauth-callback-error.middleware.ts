import type { NextFunction, Request, Response } from 'express';

const CALLBACK_PATH = '/auth/validate/google';

/**
 * Google redirects here with `?error=access_denied` when the user cancels.
 * Runs before Passport; we redirect to the web app instead of a JSON 401.
 */
export function oauthCallbackErrorRedirectMiddleware(
  getClientOrigin: () => string
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // `curl -I` sends HEAD, not GET — treat HEAD like GET so metadata checks see 302.
    const methodOk = req.method === 'GET' || req.method === 'HEAD';
    if (!methodOk || req.path !== CALLBACK_PATH) {
      return next();
    }
    if (req.query['error'] !== 'access_denied') {
      return next();
    }

    const origin = getClientOrigin().replace(/\/$/, '');
    const url = new URL('/signin', origin);
    url.searchParams.set('oauth', 'cancelled');

    const back = req.session?.postLoginRedirect;
    if (typeof back === 'string' && back.length > 0) {
      url.searchParams.set('redirect', back);
      delete req.session.postLoginRedirect;
    }

    return res.redirect(302, url.toString());
  };
}
