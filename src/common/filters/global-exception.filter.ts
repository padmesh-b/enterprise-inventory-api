import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { RequestWithContext } from '../middleware/request-context.middleware';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithContext>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    const errorCode =
      typeof exceptionResponse === 'object' && exceptionResponse?.errorCode
        ? exceptionResponse.errorCode
        : this.getDefaultErrorCode(status);

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse?.message
        ? exceptionResponse.message
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const requestId = request.requestId || 'unknown';
    const timestamp = new Date().toISOString();
    const path = request.url;

    const errorEnvelope = {
      statusCode: status,
      errorCode,
      message,
      requestId,
      timestamp,
      path,
    };

    this.logger.error(
      JSON.stringify({
        ...errorEnvelope,
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    );

    response.status(status).json(errorEnvelope);
  }

  private getDefaultErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
