import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  create(body: CreateUserDto) {
    const user = this.usersRepository.create(body);

    return this.usersRepository.save(user);
  }

  findOne(userId: number) {
    return this.usersRepository.findOneBy({ id: userId });
  }

  find(userEmail: string) {
    return this.usersRepository.find({ where: { email: userEmail } });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return this.usersRepository.save({ ...user, ...attrs });
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return this.usersRepository.remove(user);
  }
}
