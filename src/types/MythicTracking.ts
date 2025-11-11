export type TrackableRarity = "mythic" | "legendary";
import {GirlID} from "./GameTypes";


export interface TrackedGirl {
  name: string;
  ico: string;
  rarity: TrackableRarity;
  number_fight: number;
  begin_shards_count?: number;
  end_shards_count?: number;
}

export type TrackedGirlRecords = Record<GirlID, TrackedGirl>;
