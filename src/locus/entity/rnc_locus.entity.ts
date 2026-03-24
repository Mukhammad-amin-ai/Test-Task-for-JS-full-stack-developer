import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RncLocusMember } from './rnc_locus_member.entity';

@Entity('rnc_locus')
export class RncLocus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'assembly_id', nullable: true })
  assemblyId: string;

  @Column({ name: 'locus_name', nullable: true })
  locusName: string;

  @Column({ name: 'public_locus_name', nullable: true })
  publicLocusName: string;

  @Column({ name: 'chromosome', nullable: true })
  chromosome: string;

  @Column({ name: 'strand', nullable: true })
  strand: string;

  @Column({ name: 'locus_start', nullable: true })
  locusStart: number;

  @Column({ name: 'locus_stop', nullable: true })
  locusStop: number;

  @Column({ name: 'member_count', nullable: true })
  memberCount: number;

  @OneToMany(() => RncLocusMember, (member) => member.locus)
  locusMembers: RncLocusMember[];
}
