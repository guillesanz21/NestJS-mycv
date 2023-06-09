// DTO for output data
import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;
}

// Expose() decorator is used to expose the property to the output data
