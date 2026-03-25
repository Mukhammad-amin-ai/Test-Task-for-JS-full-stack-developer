import { Test, TestingModule } from '@nestjs/testing';
import { LocusService } from './locus.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RncLocus } from './entity/rnc_locus.entity';

describe('LocusService', () => {
  let service: LocusService;
  let repo: Repository<RncLocus>;

  const mockRepo = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocusService,
        {
          provide: getRepositoryToken(RncLocus),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<LocusService>(LocusService);
    repo = module.get(getRepositoryToken(RncLocus));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('admin can use sideload', async () => {
    const qb = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    mockRepo.createQueryBuilder.mockReturnValue(qb);

    const dto: any = {
      include: 'locusMembers',
    };

    const user: any = { role: 'admin' };

    await service.getLocus(dto, user);

    expect(qb.leftJoinAndSelect).toHaveBeenCalled();
  });

  it('normal user should not receive locusMembers', async () => {
    const qb: any = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest
        .fn()
        .mockResolvedValue([[{ id: 1, locusMembers: [{ id: 10 }] }], 1]),
    };

    mockRepo.createQueryBuilder.mockReturnValue(qb);

    const dto: any = {};
    const user: any = { role: 'normal' };

    const result = await service.getLocus(dto, user);

    expect(result.data[0].locusMembers).toBeUndefined();
  });

  it('limited user should apply region filter', async () => {
    const qb: any = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    mockRepo.createQueryBuilder.mockReturnValue(qb);

    const dto: any = {};
    const user: any = { role: 'limited' };

    await service.getLocus(dto, user);

    expect(qb.innerJoin).toHaveBeenCalled();
    expect(qb.andWhere).toHaveBeenCalled();
  });
});
