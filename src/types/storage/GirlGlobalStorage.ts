import { GirlRarity } from "../game";

export type GirlGlobalStorage = {
  [key: string]: {
    name: string;
    rarity: number;
    ico?: string;
    poseImage?: string;
    shards: number;
    skins?: Array<{
      skinIco?: string;
      id_girl_grade_skin: number;
      shards: number;
      num_order: number;
      skinPose?: string;
    }>;
  };
};
