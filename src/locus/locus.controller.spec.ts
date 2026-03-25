import { Test, TestingModule } from '@nestjs/testing';
import { LocusController } from './locus.controller';
import { LocusService } from './locus.service';

describe('LocusController', () => {
  let controller: LocusController;

  const mockService = {
    getLocus: jest.fn().mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 1000,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocusController],
      providers: [
        {
          provide: LocusService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LocusController>(LocusController);
  });

  it('should call service', async () => {
    const req: any = {
      user: { sub: 1 },
    };

    const dto: any = {};

    const res = await controller.getLocus(req, dto);

    expect(res.total).toBe(0);
    expect(mockService.getLocus).toHaveBeenCalled();
  });
});
