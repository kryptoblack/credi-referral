import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { FindOptionsSelect, Repository } from 'typeorm';

import { Referral } from 'src/referral/referral.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReferralService {
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
    private readonly userService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async expireReferralDueToTimeout(): Promise<void> {
    /**
     * This method is responsible for expiring a referral link due to timeout.
     *
     * The number of referral links is expected to be large. This might cause
     * performance issues if a job is scheduled for each referral link. A batch
     * approched is used instead to avoid this issue.
     *
     * @returns void
     */

    const now = Date.now();
    this.referralRepository
      .createQueryBuilder()
      .softDelete()
      .where('expiredAt < :now', { now })
      .execute();
  }

  async getReferralCount(userId: number): Promise<number> {
    /**
     * This method is responsible for getting the referral count for the user.
     *
     * @param userId The user ID.
     * @returns The referral count.
     */

    return await this.referralRepository.count({ where: { user: userId } });
  }

  generateReferralLink(userId: number, code: string): string {
    /**
     * This method is responsible for generating a referral link for the user.
     *
     * @param userId The user ID.
     * @param code The referral code.
     * @returns The referral link.
     */

    const protocol = this.configService.get<string>('APP.protocol');
    const domain = this.configService.get<string>('APP.domain');
    const link = `${protocol}://${domain}/referral/${userId}/${code}`;
    return link;
  }

  async createReferral(userId: number, code: string): Promise<void> {
    /**
     * This method is responsible for creating a referral link for the user.
     *
     * @param userId The user ID.
     * @param code The referral code.
     * @returns void
     */

    await this.referralRepository.save({
      user: userId,
      code: code,
    });
  }

  async getActiveReferral(
    userId: number,
    code: string,
    select?: FindOptionsSelect<Referral>,
  ): Promise<Referral | null> {
    try {
      const referral = await this.referralRepository.findOne({
        where: { user: userId, code: code, expiredAt: null },
        order: { createdAt: 'desc' },
        select: {
          createdAt: true,
          ...select,
        },
      });
      return referral;
    } catch (error) {
      return null;
    }
  }

  async expireReferralByUserId(userId: number): Promise<void> {
    /**
     * This method is responsible for expiring a referral link for a user.
     *
     * @param userId The user ID.
     * @returns void
     */

    await this.referralRepository.softDelete({ user: userId });
  }

  async verifyReferral(
    referrerUserId: number,
    refereeUserId: number,
    code: string,
  ): Promise<Partial<Referral>> {
    /**
     * This method is responsible for verifying a referral code.
     *
     * @param referrerUserId The ID of user who is referring.
     * @param refereeUserId The ID of user who is being referred.
     * @param code The referral code.
     * @returns true if the referral code is valid, false otherwise.
     */

    const activeReferral = await this.getActiveReferral(refereeUserId, code, {
      id: true,
    });
    if (!activeReferral) return null;

    const extraCalls = [];
    if (activeReferral.usageCount + 1 === 5) {
      extraCalls.push(this.expireReferralByUserId(referrerUserId));
      extraCalls.push(
        this.referralRepository.increment(
          { id: activeReferral.id },
          'usageCount',
          1,
        ),
      );
    }

    await Promise.all([
      this.userService.addBalance(refereeUserId, 5000),
      this.userService.addReferral(referrerUserId, activeReferral.id),
      ...extraCalls,
    ]);

    return activeReferral;
  }
}
