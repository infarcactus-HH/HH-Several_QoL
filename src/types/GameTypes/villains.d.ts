import {
  GradeSkins,
  PlainGirls,
} from "./girls";
import {
  Class,
  GirlID,
  GirlRarity,
  ObjectivePoints,
  OpponentFighter,
} from "../GameTypes";
import { battleLostItem, gemsItem, itemDropItem, orbsItem, progressionItem, softCurrencyItem, ticketItem } from "./items";

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
  girl_class: Class;
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

export interface PreFightShard extends Shard {
  // very weird value
  // "1" for mythic ?, "6" for legendary ?, "100" for rare ? No idea what it's
  // for maybe biggest possible drop ?
  value: string;
}

export type PreFightShards = Array<PreFightShard>;

export interface PostFightShard extends Shard {
  // despite the name `previous_value` it's not actually the amount of previously
  // owned shards. it is the difference between `value` and the amount of gained
  // shards which only matches up with the previously owned shards if there is no
  // overflow that gets turned into skin shards or flowers.
  previous_value: number;
  // new owned *girl* shard value
  value: number;
}

export type PostFightShards = Array<PostFightShard>;

export type BasicReward = softCurrencyItem | gemsItem | ticketItem | itemDropItem | battleLostItem | orbsItem | progressionItem;

export type BasicRewards = Array<BasicReward>;

export interface VillainPreBattle extends OpponentFighter {
  rewards: {
    data: {
      has_lively_scene?: true; // when there's a video
      loot: false; // false indicating showing potential rewards
      rewards: BasicRewards;
      shards?: PreFightShards;
    };
    girls_plain: PlainGirls | [];
  };
}

export interface DoBattlesTrollsResponse {
  battle_result: "hero_won" | "opponent_won";
  hero_changes: {
    currency?: { // if paying for x10/x50
      hard_currency: number;
    }
    energy_fight: number;
    energy_fight_recharge_time: number;
    ts_fight: number;
  },
  objective_points?: ObjectivePoints;
  result: "won"; // even when losing
  rewards?: {
    data: {
      girls?: PostFightShards; // if girl is obtained
      grade_skins?: GradeSkins; // if a skin is obtained
      loot: true; // true indicating showing actual rewards
      rewards: BasicRewards;
      shards?: PostFightShards; // if shards are obtained
    },
    heroChangesUpdate: {
      currency?: {
        soft_currency?: number; // owned total amount
        ticket?: number; // owned total amount
      }
      soft_currency?: number; // no idea, doesn't match soft_currency in rewards.data.rewards
    } | [];
    lose: boolean;
    redirectUrl: string; // "/troll-pre-battle.html?id_opponent=7"
    sub_title?: string; // for reward popup
    title: string; // for reward popup
  }
  success: boolean; // of the request, not the battle itself
  rounds : any;
}
