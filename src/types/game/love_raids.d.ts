interface LoveRaidsBase {
  all_is_owned: boolean;
  announcement_type_name: "partial" | "full" | "none";
  background_id: number;
  end_datetime: string; // "2025-10-24 05:00:00"
  event_duration_seconds: number;
  event_name: string; // "Mysterious Love Raid" smh
  girl_data: any; // TODO ?
  id_announcement_type: 1 | 2 | 3;
  id_girl: number;
  id_raid: number;
  is_mega_raid: boolean;
  raid_module_pk: number; // it's to know which troll / champ it's for
  raid_module_type: "season" | "troll" | "champion";
  start_datetime: string; // "2025-10-23 07:00:00"
  tranche_data: any; // TODO ?
}

interface LoveRaidsOngoing extends LoveRaidsBase {
  status: "ongoing";
  seconds_until_event_end: number;
}

interface LoveRaidsUpcoming extends LoveRaidsBase {
  status: "upcoming";
  seconds_until_event_start: number;
}

export type love_raids = LoveRaidsOngoing | LoveRaidsUpcoming;

type love_raids_girl_dataMysteriousIncomplete = {
  ico: `${IMAGES_URL}/pictures/girls/${number}/av${string}.png`;
  name: "Mysterious girl";
};

type love_raids_girl_dataIncomplete = {
  ico: `${IMAGES_URL}/pictures/girls/${number}/av${string}.png`;
  name: string;
};
