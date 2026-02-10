import { Rarity, GirlID, HeroClass } from ".";

export type GirlRarity = Rarity | "starting";

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

export interface Shard {
  animated_grades: Array<any> | [];
  avatar: string; //'https://hh.hh-content.com/pictures/girls/10/ava0.png?v=3';
  black_avatar: string; //'https://hh.hh-content.com/pictures/girls/10/avb0.png?v=3';
  caracs: {
    carac1: number; // or float e.g 3.5
    carac2: number;
    carac3: number;
  };
  default_avatar: string; //'https://hh.hh-content.com/pictures/girls/10/ava0.png?v=3';
  element_data: {
    type: string; //'water';
    weakness: string; //'sun';
    domination: string; //'fire';
    domination_ego_bonus_percent: number; //10;
    domination_damage_bonus_percent: number; //10;
    domination_critical_chance_bonus_percent: number; //20;
    ico_url: string; //'https://hh.hh-content.com/pictures/girls_elements/Sensual.png';
    flavor: string; //'Sensual';
  };
  girl_class: HeroClass;
  grade_offsets: {
    static: Array<number>; // [238, 282, 150, 280];
    animated: Array<number>; //  [238, 282, 150, 280];
  };
  graded2: string; //'<g class="grey"></g><g class="grey"></g><g class="grey"></g>';
  ico: string; //'https://hh.hh-content.com/pictures/girls/10/ico0.png?v=3';
  id_girl: GirlID;
  is_girl_owned: boolean;
  level: 1; // always 1 even if you own the girl and have leveled her up already
  name: string; //'Arcana';
  rarity: GirlRarity;
  role: number | null; // 10;
  salary_per_hour: number;
  slot_class: false;
  type: "girl_shards";
}
