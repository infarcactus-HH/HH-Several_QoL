import { HeroClass, Rarity } from "../common";

export type GirlArmorItem = {
  type: "girl_armor";
  value: {
    armor: {
      carac1: number;
      carac2: number;
      carac3: number;
      damage: number;
      defense: number;
      ego: number;
      id_girl_item_armor: 1 | 2 | 3 | 4 | 5;
      rarity: Rarity;
    };
    carac: {
      carac1: number;
      carac2: number;
      carac3: number;
      damage: number;
      defense: number;
      ego: number;
    };
    id_girl_armor: string; //"341938729";
    id_girl_item_armor: 1 | 2 | 3 | 4 | 5;
    id_item_skin: number;
    id_member: number;
    id_variation: number;
    level: 1;
    rarity: Rarity;
    resonance_bonuses: []; // ONLY IN PACHINKO RESPONSE IT LOOKS LIKE THIS
    skin: {
      ico: string;
      id_item_skin: number;
      id_skin_set: number;
      identifier: string; //"EA117";
      name: string; //"Luxury handbag";
      release_date: string; //"1900-01-01";
      subtype: number; //6;
      wearer: "girl";
      weight: 1; // ??????
    };
    slot_index: 1 | 2 | 3 | 4 | 5 | 6;
    type: "girl_armor";
    // need more testing for variation ???
    variation: GirlArmorVariation;
  };
};

export type GirlArmorVariation =
  | null
  | {
      class: HeroClass;
      class_resonance: "ego";
      element: null;
      element_resonance: null;
      figure: null;
      figure_resonance: null;
      id_variation: number; //1;
      rarity: Extract<Rarity, "epic">;
    }
  | {
      class: HeroClass;
      class_resonance: "ego";
      element: string; //null;
      element_resonance: "defense";
      figure: null;
      figure_resonance: null;
      id_variation: number; //23;
      rarity: Extract<Rarity, "legendary">;
    }
  | {
      class: HeroClass;
      class_resonance: "ego";
      element: string; //null;
      element_resonance: "defense";
      figure: number;
      figure_resonance: "damage";
      id_variation: number; //41;
      rarity: Extract<Rarity, "mythic">;
    };
