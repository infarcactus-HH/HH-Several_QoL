import { GirlID, GirlRarity } from "../GameTypes";

export interface PlainSkin {
  ico_path: string;
  is_owned: boolean;
}

export type PlainSkins = Array<PlainSkin>;

export interface GradeSkin {
  animation_format: "video" | "spine" | [];
  girl_grade_num: number;
  grade_skin_name: string;
  ico_path: string;
  id_girl: GirlID;
  id_girl_grade_skin: number;
  image_path: string;
  is_owned: boolean;
  is_released: boolean; // unlikely that this is ever false on prod
  num_order: number;
  offset_values: {
    animated: Array<number>;
    static: Array<number>;
  };
  previous_skin_shards: number;
  rarity: GirlRarity;
  release_date: string; // "2025-10-08"
  shards_added: number;
  type: string; // "base" ?
}

export type GradeSkins = Array<GradeSkin>;

export interface GirlMinimalData {
  ico: string;
  id_girl: GirlID;
  rarity: GirlRarity;
}

export interface PlainGirl extends GirlMinimalData {
  is_girl_owned?: true;
  grade_skins?: PlainSkins;
}

export type PlainGirls = Array<PlainGirl>;
