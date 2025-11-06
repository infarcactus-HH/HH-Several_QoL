import { GirlMinimalData } from "./girls";

export type villain_opponent_fighter_Pre_Battle_Incomplete = {
  // incomplete
  player: { // player here is the Troll
    id_fighter: number;
    nickname: string;
    ico : string;
  };
  rewards: {
    girls_plain: Array<GirlMinimalData> | [];
    data: {
      // has_lively_scene: true // when there's a video
      loot: boolean; // Always false ?
      shards?: Array<Shards_Pre_Fight>;
    };
  };
};

export interface Shards_Pre_Fight {
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
  girl_class: 1 | 2 | 3;
  grade_offsets: {
    static: Array<number>; // [238, 282, 150, 280];
    animated: Array<number>; //  [238, 282, 150, 280];
  };
  graded2: string; //'<g class="grey"></g><g class="grey"></g><g class="grey"></g>';
  ico: string; //'https://hh.hh-content.com/pictures/girls/10/ico0.png?v=3';
  id_girl: number;
  is_girl_owned: boolean;
  level: 1; // prolly number but since girl is unowned it's 1
  name: string; //'Arcana';
  rarity: "mythic" | "legendary" | "epic" | "rare" | "common" | "starting";
  role: number | null; // 10;
  salary_per_hour: number;
  slot_class: false;
  type: "girl_shards";
  value: string; //"1" for mythic ?, "6" for legendary ?, "100" for rare ? No idea what it's for maybe biggest possible drop ?
}

export interface Shards_Post_Fight extends Shards_Pre_Fight {
  previous_value: number; //previous *shard* value
  value: number; //new *shard* value
  // is_girl_owned is true when shards reach 100
}