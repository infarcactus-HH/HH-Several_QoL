export interface MythicTrackedGirl {
  id_girl: number;
  name: string;
  ico: string;
  number_fight: number;
  begin_shards_count?: number;
  end_shards_count?: number;
}

export type MythicTrackedGirlsMap = Record<number, MythicTrackedGirl>;
