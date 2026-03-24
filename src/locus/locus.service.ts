import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { RncLocus } from './entity/rnc_locus.entity';
import { RncLocusMember } from './entity/rnc_locus_member.entity';

import { GetLocusDto } from './dto/locus.dto';

import { User } from './locus.controller';
import { SideloadEnum } from '../shared/types';

const LIMITED_REGION_IDS = [86118093, 86696489, 88186467];

@Injectable()
export class LocusService {
  constructor(
    @InjectRepository(RncLocus)
    private readonly locusRepository: Repository<RncLocus>,
    @InjectRepository(RncLocusMember)
    private readonly memberRepository: Repository<RncLocusMember>,
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

    if (isNormal && include?.length) {
      throw new ForbiddenException('normal cannot use sideload');
    }

    const qb = this.locusRepository
      .createQueryBuilder('rl')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(`rl.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    const needsMemberJoin =
      regionId?.length ||
      membershipStatus ||
      include?.includes(SideloadEnum.LOCUS_MEMBERS) ||
      isLimited;
    console.log(needsMemberJoin);
    if (needsMemberJoin) {
      qb.leftJoinAndSelect('rl.locusMembers', 'rlm');
    }

    if (id?.length) {
      qb.andWhere('rl.id IN (:...id)', { id });
    }

    if (assemblyId !== undefined) {
      qb.andWhere('rl.assembly_id = :assemblyId', { assemblyId });
    }

    if (regionId?.length) {
      qb.andWhere('rlm.region_id IN (:...regionId)', { regionId });
    }

    if (membershipStatus) {
      qb.andWhere('rlm.membership_status = :membershipStatus', {
        membershipStatus,
      });
    }

    if (isLimited) {
      qb.andWhere('rlm.region_id IN (:...allowedRegions)', {
        allowedRegions: LIMITED_REGION_IDS,
      });
    }

    const [loci, total] = await qb.getManyAndCount();

    if (isAdmin && include?.includes(SideloadEnum.LOCUS_MEMBERS)) {
      const locusIds: number[] = loci.map((l) => l.id);

      if (locusIds.length) {
        const members = await this.memberRepository.find({
          where: { locusId: In(locusIds) },
        });

        const membersByLocusId = members.reduce(
          (acc, m) => {
            if (!acc[m.locusId]) acc[m.locusId] = [];
            acc[m.locusId].push(m);
            return acc;
          },
          {} as Record<number, RncLocusMember[]>,
        );

        return loci.map((locus) => ({
          ...locus,
          locusMembers: membersByLocusId[locus.id] ?? [],
        }));
      }
    }

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
