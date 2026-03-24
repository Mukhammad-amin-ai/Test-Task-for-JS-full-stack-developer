export interface JwtPayload {
  sub: number;
  username: string;
  role: 'admin' | 'normal' | 'limited';
}

export enum SideloadEnum {
  LOCUS_MEMBERS = 'locusMembers',
}

export enum SortFieldEnum {
  ID = 'id',
  ASSEMBLY_ID = 'assemblyId',
  LOCUS_START = 'locusStart',
  LOCUS_STOP = 'locusStop',
  MEMBER_COUNT = 'memberCount',
  CHROMOSOME = 'chromosome',
}

export enum SortOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}
