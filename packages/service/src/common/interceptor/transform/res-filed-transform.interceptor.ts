import { CallHandler, ExecutionContext, NestInterceptor, mixin, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function ResFieldTransformInterceptor<T extends object>(
  fieldName: keyof T,
  transformFn: (value: any) => any
): Type<NestInterceptor> {
  class TransformMixinInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map((data) => {
          if (Array.isArray(data)) {
            // 如果是数组，则遍历每一项
            data.forEach((item) => this.transformItem(item));
          } else {
            // 如果是单个实体，则直接处理
            this.transformItem(data);
          }
          return data;
        })
      );
    }

    private transformItem(item: T) {
      if (fieldName in item) {
        item[fieldName] = transformFn(item[fieldName]);
      }
    }
  }

  const Interceptor = mixin(TransformMixinInterceptor);
  return Interceptor;
}
