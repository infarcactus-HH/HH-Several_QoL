import { Class } from "./common";

export type sharedHeroIncomplete = {
  infos: sharedHeroInfos;
  update: (data: any) => void;
  updates: (data: any) => void;
};

export type sharedHeroInfos = {
  Xp: any;
  avs_required: boolean;
  carac1: number;
  carac2: number;
  carac3: number;
  id: number;
  caracs: {
    carac1: number;
    carac2: number;
    carac3: number;
    chance: number;
    endurance: number;
    primary_carac_amount: number;
    secondary_caracs_sum: number;
  };
  class: Class;
  club_cooldown_ts: number; // time until can join back a club
  harem_endurance: number;
  hc_confirm: boolean;
  hh_skin: "hentai" | (string & {});
  hh_universe: "nutaku" | "hentai" | "test_h" | (string & {});
  id: number;
  is_cheater: 0 | 1;
  is_tester: 0 | 1;
  level: number;
  market_stats_purchase_steps: [1, 10, 30, 60];
  name: string;
  no_pachinko_anim: boolean;
  no_static_image_animation: boolean;
  nosound: boolean;
  on_prod_server: boolean; // always true ?
  pwa_rewards_claimed: [] | any; // unsure of the content
  questing: {
    choices_adventure: number; //0;
    current_url: string; //"/quest/1421?sess=bsfqosa27drvm3fjkj64ji5oue";
    id_quest: number;
    id_world: number;
    num_step: number;
    num_world: number;
    step: number;
  };
  screen_ratio: number;
  server_time: string; //"2025-12-20T19:31:10+01:00";
  xp: number;
};
