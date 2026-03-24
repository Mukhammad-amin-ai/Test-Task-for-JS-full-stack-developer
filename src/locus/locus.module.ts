import { Module } from '@nestjs/common';
import { LocusService } from './locus.service';
import { LocusController } from './locus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RncLocus } from './entity/rnc_locus.entity';
import { RncLocusMember } from './entity/rnc_locus_member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RncLocus, RncLocusMember])],
  controllers: [LocusController],
  providers: [LocusService],
})
export class LocusModule {}
