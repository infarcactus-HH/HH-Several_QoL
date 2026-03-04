import { GirlRarity } from "../game";

export type GirlGlobalStorage = {
  [key: string]: {
    name: string;
    rarity: GirlRarity;
    ico?: string;
    shards: number;
    skins?: Array<{
      ico_path?: string;
      id_girl_grade_skin: number;
      shards: number;
    }>;
  };
};
