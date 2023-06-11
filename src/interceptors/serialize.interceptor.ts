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
        // Explanation:
        // 1. The data is the response from the request handler.
        // 2. The dto is the class that we want to transform the data into.
        // 3. The plainToInstance function is a function from the class-transformer library. It takes 3 arguments:
        //    3.1. The class that we want to transform the data into.
        //    3.2. The data that we want to transform.
        //    3.3. An options object. We set excludeExtraneousValues to true to exclude any properties that are not defined in the dto.
        // 4. The return value of the plainToInstance function is the transformed data.
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
