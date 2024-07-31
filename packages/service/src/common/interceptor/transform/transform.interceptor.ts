import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from 'src/types';

// todo: 某些情况下，需要支持返回原始数据，而不是包装过一层
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IApiResponse<T>> {
    // 检查是否应用了 @Redirect() 装饰器
    const isRedirect = this.isRedirect(context.getHandler());

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    if (isRedirect) {
      // 如果应用了 @Redirect()，则不应用转换，直接返回原始数据
      return next.handle();
    } else {
      return next.handle().pipe(
        map((data) => {
          if (
            request.method === 'POST' &&
            /^2\d{2}$/.test(String(context.switchToHttp().getResponse().statusCode))
          ) {
            context.switchToHttp().getResponse().statusCode = 200;
          }
          return { code: 0, data, message: 'success' };
        })
      );
    }
  }

  private isRedirect(handler: Function): boolean {
    const metadata = Reflect.getMetadataKeys(handler);

    return metadata.includes('__redirect__');
  }
}
