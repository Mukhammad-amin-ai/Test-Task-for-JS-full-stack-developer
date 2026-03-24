import { Test, TestingModule } from '@nestjs/testing';
import { LocusController } from './locus.controller';
import { LocusService } from './locus.service';

describe('LocusController', () => {
  let controller: LocusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocusController],
      providers: [LocusService],
    }).compile();

    controller = module.get<LocusController>(LocusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
