import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { RequestWithContext } from '../middleware/request-context.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<RequestWithContext>();
    const { method, url } = req;
    const requestId = req.requestId || 'unknown';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;
        const responseTimeMs = Date.now() - now;

        const logMessage = JSON.stringify({
          requestId,
          method,
          url,
          statusCode,
          responseTimeMs,
          user: (req as any).user ? { userId: (req as any).user.userId, companyId: (req as any).user.companyId } : undefined,
        });

        this.logger.log(logMessage);
      }),
    );
  }
}
