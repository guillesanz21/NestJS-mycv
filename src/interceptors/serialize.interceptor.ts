import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance, ClassConstructor } from 'class-transformer';

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: ClassConstructor<T>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    // Run something before a request is handled by the request handler
    return next.handle().pipe(
      map((data: T) => {
        // Run something before the response is sent out
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}

// * Interceptor structure:
// intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//   // Run something before a request is handled by the request handler
//   return next.handle().pipe(
//     map((data: any) => {
//       // Run something before the response is sent out
//     }),
//   );
// }
