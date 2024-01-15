import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsSelect, Repository } from 'typeorm';

import { User } from 'src/users/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async checkIfUsernameExists(username: string): Promise<boolean> {
    return await this.userRepository.exists({ where: { username } });
  }

  async findOneById(
    id: number,
    select?: FindOptionsSelect<User>,
  ): Promise<User> {
    return await this.userRepository.findOne({ where: { id }, select });
  }

  async getBalance(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['balance'],
    });

    return user.balance;
  }

  async addBalance(userId: number, amount: number): Promise<void> {
    /**
     * This method is responsible for adding amount to the total balance of the
     * user.
     *
     * @param userId The user ID.
     * @param amount The amount to add.
     * @returns void
     */

    await this.userRepository.update(
      { id: userId },
      { balance: () => `balance + ${amount}` },
    );
  }

  async addReferral(userId: number, referralId: number): Promise<void> {
    /**
     * This method is responsible for updating the referral ID of the user.
     *
     * @param userId The user ID.
     * @param referralId The referral ID.
     * @returns void
     */

    await this.userRepository.update({ id: userId }, { referral: referralId });
  }
}
