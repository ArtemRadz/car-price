import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signUp(body: CreateUserDto) {
    const users = await this.usersService.find(body.email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(body.password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    const user = this.usersService.create({
      email: body.email,
      password: result,
    });

    return user;
  }

  async signIn(body: CreateUserDto) {
    const [user] = await this.usersService.find(body.email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(body.password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }

    return user;
  }
}
