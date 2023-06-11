import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
// promofisy is a node module that takes a callback based function and turns it into a promise based function
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // * See if email is in use
    const users = await this.usersService.find(email);

    // * If email is in use, throw an error
    if (users.length) {
      throw new BadRequestException('email in use');
    }
    // * Hash the password
    // 1. Generate a salt
    const salt = randomBytes(8).toString('hex');

    // 2. Hash the password with the salt
    const hash = (await scrypt(password, salt, 32)) as Buffer; // scrypt returns a buffer

    // 3. Join the hashed password and the salt together
    const separator = '.';
    const result = salt + separator + hash.toString('hex');

    // * Create a new user and save it
    const user = await this.usersService.create(email, result);

    // * Return the user
    return user;
  }

  async signin(email: string, password: string) {
    // * Find the user in the database with the email. If it doesn't exist, throw an error
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    // * Hash the provided password and compare it to the stored password (retrieved from the database)
    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // * If it's incorrect, throw an error, otherwise return the user
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('invalid credentials');
    } else {
      return user;
    }
  }
}
