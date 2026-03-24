import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { RncLocus } from './rnc_locus.entity';

@Entity('rnc_locus_members')
export class RncLocusMember {
  @PrimaryColumn({ name: 'id' })
  locusMemberId: number;

  @Column({ name: 'region_id', nullable: true })
  regionId: number;

  @Column({ name: 'locus_id', nullable: true })
  locusId: number;

  @Column({ name: 'membership_status', nullable: true })
  membershipStatus: string;

  @ManyToOne(() => RncLocus, (locus) => locus.locusMembers)
  @JoinColumn({ name: 'locus_id' })
  locus: RncLocus;
}
