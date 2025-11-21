import { GirlID, GirlRarity } from "./GameTypes";

export interface TrackedGirl {
  name: string;
  ico: string;
  rarity: GirlRarity;
  number_fight: number;
  grade: number;
  dropped_shards: number;
  last_shards_count?: number;
  last_fight_time?: number;
  skins?: Array<{
    ico_path: string;
    number_fight: number;
    dropped_shards?: number;
    is_owned: boolean;
  }>;
}

export type TrackedGirlRecords = Record<GirlID, TrackedGirl>;
