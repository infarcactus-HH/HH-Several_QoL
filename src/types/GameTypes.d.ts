export interface global_pop_hero_girls_incomplete {
  id_girl: number;
  carac1: number;
  carac2: number;
  carac3: number;
  id_places_of_power: number | null;
}

export interface PoPGirlData {
  assigned: number | -1;
  avatar: string;
  carac_1: number;
  carac_2: number;
  carac_3: number;
  carac_1_initial: number;
  carac_2_initial: number;
  carac_3_initial: number;
  id_girl: number;
  name: string;
  rarity: string;
}

export interface PlacesOfPowerReward {
  loot: boolean;
  name?: string;
  rewards: Array<any>; // Maybe to do unsure if I actually will do it
}

export interface PlacesOfPowerData {
  base_power: number;
  class: 1 | 2 | 3;
  criteria: "carac_1" | "carac_2" | "carac_3";
  carac_2;
  carac_3;
  description: string;
  duration: number | null;
  ends_in: number | null;
  girl?: any; // TODO ?
  girls: Array<PoPGirlData>;
  id_girl: number;
  id_places_of_power: number;
  id_world: number;
  image: string;
  level: number;
  level_power: number;
  levelup_cost: number;
  locked: 1 | undefined;
  max_level: number;
  max_power: number | null;
  max_team_power: number;
  min_level: number | null;
  multiplier: string;
  next_level_power: number;
  next_max_team_power: number;
  num_world: number;
  remaining_time: number;
  rewards: Record<number, PlacesOfPowerReward>;
  skin: string | "hentai,gay";
  status: "can_start" | "in_progress" | "pending_reward" | "locked";
  time_to_finish: number; // 0 when PoP can be started
  title: string;
  type: "standard" | "temp";
  end_ts?: number; // Added by Several QoL
}
export interface popupForQueue {
  popup: {
    $dom_element: JQuery<HTMLElement>; // main injected dom element (?) still has to be attached thoguh it seems
    init: (t: boolean) => void; // only seen it called with false
    onOpen: () => void; // called after init
    addEventListeners: () => void; // called right after open
    popup_name: string;
    close_on_esc: boolean; // wether it should close when pressing escape or not
    type: "toast" | "common" | "sliding" | "notification";
    onClose: () => void; // called when closing (for example when pressing escape if enabled)
    removeEventListeners: () => void; // called right after closing (even if close was called by destroy)
    destroy: () => void; // useful when you want to put a red cross to close the popup, only called manually
  };
  // creation flow : init(???) -> onOpen() -> addEventListeners()
  // normal close flow : onClose() -> removeEventListeners()
}

export interface MERankingHeroData {
  potions: number;
  rank: number;
  rewards: Array<any>;
}

export interface MERankingLeaderboardEntryIncomplete {
  id_member: number;
  potions: number;
  rank: number;
  rewards: Array<any>;
}

export interface LeagueOpponentIncomplete {
  // very very incomplete x)
  place: number;
  player: {
    id_fighter: number;
  };
  Several_QoL?: {
    // added by the script
    checkExpiresAt: number;
    bestPlace: number;
    timesReached: number;
  };
}

export interface sm_event_dataIncomplete {
  seconds_until_event_end: number;
}
