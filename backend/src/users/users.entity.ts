import { Referral } from 'src/referral/referral.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  salt: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: 0 })
  balance: number;

  @ManyToOne(() => Referral, (referral) => referral.id)
  referral: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
