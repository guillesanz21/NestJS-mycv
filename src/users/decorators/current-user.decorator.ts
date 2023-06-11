import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    // data is the argument passed to the decorator. If you don't pass anything, it will be undefined.
    // If we never expect to pass any data to the decorator, we can set the type of data to never. If not, we can set it to any.

    const request = context.switchToHttp().getRequest();
    return request.currentUser;
  },
);

// Execution context: It's an object that is created by Nest.js. It contains the request and response objects.
// It isn't called request because it can be used in other contexts, not just HTTP requests. For example, it can be used in web sockets or gRPC.
