import {GirlID, GirlRarity} from "./GameTypes";

export interface TrackedGirl {
  name: string;
  ico: string;
  rarity: GirlRarity;
  number_fight: number;
  grade : number;
  dropped_shards : number;
  last_shards_count?: number;
  skins? : Record<number,{
    ico: string;
    number_fight: number;
    dropped_shards?: number;
  }>;
}

export type TrackedGirlRecords = Record<GirlID, TrackedGirl>;
