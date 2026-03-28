import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { sanitizePostLoginRedirect } from '../../../../../packages/api/dist/entry';
import { firstQueryValue } from '../oauth-query.util';

/**
 * Stores the post-login path in session, then lets Passport issue a random OAuth `state` (strategy `state: true`).
 * Do not pass a custom `state` string here, that would skip the nonce store and break callback verification.
 */
@Injectable()
export class GoogleLoginGuard extends AuthGuard('google') {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const raw = firstQueryValue(req.query['redirect']);
    req.session.postLoginRedirect = sanitizePostLoginRedirect(raw);
    return (await super.canActivate(context)) as boolean;
  }
}
