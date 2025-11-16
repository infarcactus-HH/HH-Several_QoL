export type TrackableRarity = "mythic" | "legendary";
import {GirlID} from "./GameTypes";


export interface TrackedGirl {
  name: string;
  ico: string;
  rarity: TrackableRarity;
  number_fight: number;
  grade : number;
  dropped_shards : number;
  last_shards_count?: number;
  skins? : Record<number,{
    ico: string;
    number_fight: number;
    last_shards_count?: number;
  }>;
}

export type TrackedGirlRecords = Record<GirlID, TrackedGirl>;
