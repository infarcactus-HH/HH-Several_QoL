import type {
  Shards_Post_Fight,
  villain_opponent_fighter_Pre_Battle_Incomplete,
} from "../types/GameTypes/villains";
import type { MythicTrackedGirl } from "../types/MythicTracking";
import { HHModule } from "../types/HH++";
import { mythicTrackingStorageHandler } from "../utils/StorageHandler";

export default class MythicTracking extends HHModule {
  readonly configSchema = {
    baseKey: "mythicTracking",
    label: "Tracks your mythic shards drop",
    default: true,
  };
  static shouldRun() {
    return (
      location.pathname.includes("/troll-pre-battle.html") ||
      location.pathname.includes("/troll-battle.html")
    );
  }
  shouldTrackMythicShards = false;
  run() {
    if (this.hasRun || !MythicTracking.shouldRun()) {
      return;
    }
    this.hasRun = true;
    if (location.pathname === "/troll-pre-battle.html") {
      this.handlePreBattlePage();
    } else {
      const currentTrackedTrollID =
        mythicTrackingStorageHandler.getCurrentTrackingState().trollID;
      if (location.search.includes(`id_opponent=${currentTrackedTrollID}`)) {
        this.shouldTrackMythicShards = true;
      }
    }
    if (!this.shouldTrackMythicShards) {
      return;
    }
    const currentTrackedGirlID =
      mythicTrackingStorageHandler.getCurrentTrackingState().girlId;
    if (!currentTrackedGirlID) {
      return;
    }
    console.log("Mythic Tracking module is running.");
    let trackedGirlRecord =
      mythicTrackingStorageHandler.getTrackedGirl(currentTrackedGirlID);
    if (!trackedGirlRecord) {
      return;
    }
    $(document).ajaxComplete((event, xhr, settings) => {
      if (
        this.shouldTrackMythicShards &&
        typeof settings?.data === "string" &&
        settings.data.includes("action=do_battles_trolls")
      ) {
        console.log("Mythic Tracking AJAX complete detected:", {
          settings,
          xhr,
        });
        const response = xhr.responseJSON;
        const battlesMatch = settings.data.match(/number_of_battles=(\d+)/);
        const number_of_battles = battlesMatch
          ? parseInt(battlesMatch[1], 10)
          : 1;
        const responseShards = (response?.rewards?.data?.shards ??
          []) as Shards_Post_Fight[];
        const MythicShardDrop = responseShards.find(
          (shard: Shards_Post_Fight) => shard.rarity === "mythic"
        );

        trackedGirlRecord.number_fight += number_of_battles;
        if (MythicShardDrop) {
          if (!trackedGirlRecord.begin_shards_count) {
            trackedGirlRecord.begin_shards_count =
              MythicShardDrop.previous_value;
          }
          trackedGirlRecord.end_shards_count = MythicShardDrop.value;
          if (MythicShardDrop.is_girl_owned) {
            mythicTrackingStorageHandler.setCurrentTrackingState(-1);
            this.shouldTrackMythicShards = false;
          }
        }
        mythicTrackingStorageHandler.upsertTrackedGirl(trackedGirlRecord);
      }
    });
  }
  handlePreBattlePage() {
    const opponentFighter =
      unsafeWindow.opponent_fighter as villain_opponent_fighter_Pre_Battle_Incomplete;
    if (!opponentFighter) {
      return;
    }
    const mythicShards = opponentFighter.rewards.data.shards?.find(
      (shard) => shard.rarity === "mythic"
    );
    if (!mythicShards) {
      mythicTrackingStorageHandler.setCurrentTrackingState(-1);
      return;
    }
    const existingTrackedGirl = mythicTrackingStorageHandler.getTrackedGirl(
      mythicShards.id_girl
    );
    if (!existingTrackedGirl) {
      const newRecord: MythicTrackedGirl = {
        id_girl: mythicShards.id_girl,
        name: mythicShards.name,
        ico: mythicShards.ico,
        number_fight: 0,
      };
      mythicTrackingStorageHandler.upsertTrackedGirl(newRecord);
    }
    this.shouldTrackMythicShards = true;
    mythicTrackingStorageHandler.setCurrentTrackingState(
      opponentFighter.player.id_fighter,
      mythicShards.id_girl
    );
  }
}