export type TrackableRarity = "mythic" | "legendary";

export interface TrackedGirl {
  name: string;
  ico: string;
  rarity: TrackableRarity;
  number_fight: number;
  begin_shards_count?: number;
  end_shards_count?: number;
}

export type TrackedGirlRecords = Record<number, TrackedGirl>;
