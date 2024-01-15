import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import { User } from 'src/users/users.entity';
import { REFERRAL_EXPIRY_DAYS } from 'src/referral/referral.constant';

@Entity()
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: number;

  @Column({ comment: 'Referral code' })
  code: string;

  @Column({
    default: true,
    comment: 'Is referral code active? (positive form of expire)',
  })
  isActive: boolean;

  @Column({ default: 0, comment: 'Number of times referral code is used' })
  usageCount: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => `Current_TIMESTAMP + INTERVAL '${REFERRAL_EXPIRY_DAYS}' DAY`,
  })
  expireBy: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  expiredAt: Date;
}
