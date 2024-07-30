import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from './api-exception.filter';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    // const status = exception.getStatus();

    let status = HttpStatus.INTERNAL_SERVER_ERROR; // 默认状态码为500

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    if (exception instanceof ApiException) {
      response.status(status).json({
        code: exception.getErrorCode(),
        message: exception.getErrorMessage(),
      });
      return;
    }

    if (exception instanceof BadRequestException) {
      const res = exception.getResponse() as Record<string, any> | string;
      response.status(HttpStatus.BAD_REQUEST).json({
        code: HttpStatus.BAD_REQUEST,
        message: typeof res === 'object' ? res?.message?.toString() : res?.toString(),
      });
      return;
    }

    if (exception instanceof Error) {
      response.status(status).json({
        code: status,
        message: exception.message,
      });
      return;
    }

    response.status(status).json({
      code: status,
      message: (exception as any)?.message || 'Internal server error',
    });
  }
}
