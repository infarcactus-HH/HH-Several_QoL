export interface softCurrencyItem {
  type: "soft_currency";
  value: string; // e.g. '1000'
}

export interface gemsItem {
  type: "gems";
  gem_type: string; //'fire';
  gem_tooltip: string; //'Eccentric Gem';
  value: number;
}

export interface ticketItem {
  type: "ticket";
  value: string; // "1";
}

export interface battleLostItem {
  type: "battle_lost";
  battle_lost_name: "Lost";
  value: number; // 1;
}

export interface progressionItem {
  progression_type: string;
  type: "progressions";
  value: string | number; // string for Sultry
}

export interface itemDropItem {
  type: "item";
  value: {
    item: ItemTemplate;
    quantity: number;
  };
}

export interface ItemTemplate {
  id_item: number; //182;
  type: string; //'gift' | 'potion';
  identifier: string; //'K2';
  rarity: string; //'legendary';
  price: number; //396150;
  currency: string; //'sc' | 'hc';
  value: number; //950;
  carac1: number; // 0;
  carac2: number; // 0;
  carac3: number; //0;
  endurance: number; //0;
  chance: string; //'0.00';
  ego: number; //0;
  damage: number; // 0;
  duration: number; //0;
  skin: string; //'hentai,gay,sexy';
  name: string; // 'Chocolates';
  ico: string; // 'https://hh.hh-content.com/pictures/items/K2.png';
  display_price: number; //396150;
  default_market_price: number; //39615;
}

export type energyQuestsItem = {
  type: "energy_quest";
  value: string; // "5"
};

export type energyKissItem = {
  type: "energy_kiss";
  value: string; // "1"
};
