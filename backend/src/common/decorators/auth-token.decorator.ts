import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom decorator to extract the Bearer token from the Authorization header.
 * Usage: @AuthToken() token: string
 *
 * This should be used in controllers to get the user's JWT token
 * and pass it to services that need user context.
 */
export const AuthToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');
    const type = parts[0];
    const token = parts[1];

    if (type !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  },
);
