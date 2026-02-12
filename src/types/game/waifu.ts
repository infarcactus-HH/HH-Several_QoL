import { GirlArmorItem } from "./items";

export type girls_data_listIncomplete = Array<{
  armor: [] | Array<GirlArmorItem & { id_girl_armor: number }>;
}>;
