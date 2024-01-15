import { Test, TestingModule } from '@nestjs/testing';
import { ReferralController } from './referral.controller';

describe('ReferalController', () => {
  let controller: ReferralController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferralController],
    }).compile();

    controller = module.get<ReferralController>(ReferralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getReferral', () => {
    it('should return a referral', () => {});
  });

  describe('expireReferral', () => {
    it('should expire a referral', () => {});
  });

  describe('verifyReferral', () => {
    it('should verify a referral', () => {});
  });
});
