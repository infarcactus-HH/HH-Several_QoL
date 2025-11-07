export type TrackableRarity = "mythic" | "legendary";

export interface LegendaryMythicTrackedGirlRecord {
  name: string;
  ico: string;
  rarity: TrackableRarity;
  number_fight: number;
  begin_shards_count?: number;
  end_shards_count?: number;
}

export type MythicTrackedGirlsMap = Record<number, LegendaryMythicTrackedGirlRecord>;
