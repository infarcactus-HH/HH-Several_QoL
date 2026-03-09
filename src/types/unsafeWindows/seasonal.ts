import { CompleteGirl, GirlElement, GirlID } from "../game";
import { BaseUnsafeWindow } from "./baseUnsafeWindow";

export interface UnsafeWindow_seasonal_SEM extends BaseUnsafeWindow {
  mega_event_data: {
    id_seasonal_event: number;
    id_member: number;
    potions: number;
    tier: number;
    cards: string; // "", "1"
    last_card_collect_date: string;
    taken_rewards: string;
    has_pass: 0 | 1;
    triggered_reminders: string;
    taken_reward_list: string[];
    available_reward_types: ["free"] | ["free", "pass"];
    lively_scenes: Array<{
      lively_scene: {
        id_lively_scene: number;
        id_girl: number;
        order_num: number;
        name: string;
        is_unlocked: boolean;
        content: {
          image: null | string;
          video: null | string;
          image_censored: string;
          video_censored: string;
        };
        release_date: string;
        index: number;
        potions_required?: number;
      };
      from_tier: boolean;
      from_market: boolean;
    }>;
    lively_scenes_potions_required: Record<number, number>;
  };
  event_functionalities: {
    has_bundles: true;
    has_card: true;
    has_market: false;
    has_pass: true;
    has_percent_ranking: false;
    has_revival_market: true;
    has_top_ranking: false;
    id_seasonal_event_type: 4;
  };
  mega_current_tier: number;
  mega_tiers_data: Array<{
    free_reward: {
      loot: true;
      rewards: Array<any>;
    };
    free_reward_state: "available" | "claimed" | "unclaimed";
    paid_reward: {
      loot: true;
      rewards: Array<any>;
    };
    paid_reward_state: "available" | "claimed" | "unclaimed";
    potions_required: number;
    tier: number;
  }>;
  seconds_remaining: number;
  event_anchors: Array<{
    disabled: boolean; // should always be false
    label: string; // "Defeat Villains"
    url: string; // "/troll-pre-battle.html?id_opponent=14", NO SESSID
  }>;
  player_resources: number;
  hero_has_mega_pass: 0 | 1;
  pass_reminder: any;
  event_girls_all_owned: boolean;
  mega_name: string;
  mega_event_id: number;
  mega_girls: Array<{
    animated_grades: any;
    ava: string;
    element: GirlElement;
    grade_offsets: {
      static: Array<number>;
      animated: Array<number>;
    };
    has_animated_grades: boolean;
    id: GirlID;
  }>;
  girls: Array<CompleteGirl>;
}
