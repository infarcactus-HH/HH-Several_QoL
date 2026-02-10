import { GradeSkins, Shard, BasicRewards, ObjectivePoints, HeroChangesUpdate } from "../";

export interface DoBattlesTrollsResponse {
  battle_result: "hero_won" | "opponent_won";
  hero_changes: {
    currency?: {
      // if paying for x10/x50
      hard_currency: number;
    };
    energy_fight: number;
    energy_fight_recharge_time: number;
    ts_fight: number;
  };
  objective_points?: ObjectivePoints;
  result: "won"; // even when losing
  rewards?: {
    data: {
      has_lively_scene?: true; // when there's a video
      girls?: PostFightShards; // if girl is obtained
      grade_skins?: GradeSkins; // if a skin is obtained
      loot: true; // true indicating showing actual rewards
      rewards?: BasicRewards;
      shards?: PostFightShards; // if shards are obtained
    };
    // Present when rewards include soft_currency or ticket entries in BasicRewards.
    heroChangesUpdate: HeroChangesUpdate;
    lose: boolean;
    redirectUrl: string; // "/troll-pre-battle.html?id_opponent=7"
    sub_title?: string; // for reward popup
    title: string; // for reward popup
  };
  success: boolean; // of the request, not the battle itself
  rounds: any;
}

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
