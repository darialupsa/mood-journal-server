import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { UserDTO } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(username: string, password: string): Promise<UserDTO> {
    const exitingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (exitingUser) {
      throw new HttpException(
        'The user is already registered',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Generate hash

    const user = new User();
    user.username = username;
    user.password = hashedPassword;

    const savedUser = await this.userRepository.save(user);
    return this.transformUserToUserDTO(savedUser);
  }

  async login(username: string, password: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findOne({
      where: { username: ILike(username) },
    });

    if (!user) {
      return null; // User not exist
    }

    const passwordMatch = await bcrypt.compare(password, user.password); // Verify password
    return passwordMatch ? this.transformUserToUserDTO(user) : null;
  }

  transformUserToUserDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
    } as UserDTO;
  }
}
