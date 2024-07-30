import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException<ErrorCode> extends HttpException {
  private readonly errorMessage: string;
  private readonly errorCode: ErrorCode;

  constructor(errorMessage: string, errorCode: ErrorCode, statusCode: HttpStatus = HttpStatus.OK) {
    super(errorMessage, statusCode);
    this.errorMessage = errorMessage;
    this.errorCode = errorCode;
  }

  getErrorCode(): ErrorCode {
    return this.errorCode;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }
}
