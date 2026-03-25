import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RncLocus } from './entity/rnc_locus.entity';

import { GetLocusDto } from './dto/locus.dto';

import { User } from './locus.controller';
import { SideloadEnum } from '../shared/types';

const LIMITED_REGION_IDS = [31232818, 86118093, 86696489, 88186467];

@Injectable()
export class LocusService {
  constructor(
    @InjectRepository(RncLocus)
    private readonly locusRepository: Repository<RncLocus>,
  ) {}

  async getLocus(dto: GetLocusDto, user: User) {
    const {
      id,
      assemblyId,
      regionId,
      membershipStatus,
      include,
      page = 1,
      limit = 1000,
      sortBy = 'id',
      sortOrder = 'ASC',
    } = dto;

    const isAdmin = user.role === 'admin';
    const isNormal = user.role === 'normal';
    const isLimited = user.role === 'limited';

    const qb = this.locusRepository
      .createQueryBuilder('rl')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(`rl.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    const needFilterJoin = regionId?.length || membershipStatus || isLimited;

    if (needFilterJoin) {
      qb.innerJoin('rl.locusMembers', 'filter_rlm');
    }

    const needSideload =
      isAdmin && include?.includes(SideloadEnum.LOCUS_MEMBERS);

    if (needSideload) {
      qb.leftJoinAndSelect('rl.locusMembers', 'sideload_rlm');
    }

    if (id?.length) {
      qb.andWhere('rl.id IN (:...id)', { id });
    }

    if (assemblyId !== undefined) {
      qb.andWhere('rl.assembly_id = :assemblyId', { assemblyId });
    }

    if (regionId?.length) {
      qb.andWhere('filter_rlm.region_id IN (:...regionId)', { regionId });
    }

    if (membershipStatus) {
      qb.andWhere('filter_rlm.membership_status = :membershipStatus', {
        membershipStatus,
      });
    }

    if (isLimited) {
      qb.andWhere('filter_rlm.region_id IN (:...allowedRegions)', {
        allowedRegions: LIMITED_REGION_IDS,
      });
    }

    const [loci, total] = await qb.getManyAndCount();

    if (isNormal) {
      const data = loci.map((l) => {
        const copy = { ...l } as Partial<typeof l>;
        delete copy.locusMembers;
        return copy;
      });

      return { data, total, page, limit };
    }

    return {
      data: loci,
      total,
      page,
      limit,
    };
  }
}
