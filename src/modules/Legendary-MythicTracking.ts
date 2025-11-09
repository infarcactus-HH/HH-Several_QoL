import type {
  PostFightShard,
  PostFightShards,
  VillainPreBattle,
} from "../types/GameTypes/villains";
import type {
  TrackedGirl,
  TrackableRarity,
} from "../types/MythicTracking";
import { HHModule } from "../types/HH++";
import { legendaryMythicTrackingStorageHandler } from "../utils/StorageHandler";

export default class LegendaryMythicTracker extends HHModule {
  readonly configSchema = {
    baseKey: "legendaryMythicTracking",
    label: "<span tooltip='No way to see what you tracked for now,will be released later'>Tracks your Legendary & Mythic drops from Villains</span>",
    default: true,
  };
  static shouldRun() {
    return (
      location.pathname.includes("/troll-pre-battle.html") ||
      location.pathname.includes("/troll-battle.html")
    );
  }
  shouldTrackShards = false;
  readonly trackableRarities = ["mythic", "legendary"] as Array<TrackableRarity>;
  run() {
    if (this.hasRun || !LegendaryMythicTracker.shouldRun()) {
      return;
    }
    this.hasRun = true;
    if (location.pathname === "/troll-pre-battle.html") {
      this.handlePreBattlePage();
    } else {
      const currentTrackedTrollID =
        legendaryMythicTrackingStorageHandler.getCurrentTrackingState().trollID;
      if (location.search.includes(`id_opponent=${currentTrackedTrollID}`)) {
        this.shouldTrackShards = true;
      }
    }
    if (!this.shouldTrackShards) {
      return;
    }
    const currentTrackedGirlIds =
      legendaryMythicTrackingStorageHandler.getCurrentTrackingState().girlIds;
    if (
      !Array.isArray(currentTrackedGirlIds) ||
      !currentTrackedGirlIds.length
    ) {
      return;
    }
    console.log("LegendaryMythicTracker module is running.");
    $(document).ajaxComplete((_event, xhr, settings) => {
      if (
        this.shouldTrackShards &&
        typeof settings?.data === "string" &&
        settings.data.includes("action=do_battles_trolls")
      ) {
        console.log("LegendaryMythicTracker AJAX complete detected:", {
          settings,
          xhr,
        });
        const response = xhr.responseJSON;
        const battlesMatch = settings.data.match(/number_of_battles=(\d+)/);
        const number_of_battles = battlesMatch
          ? parseInt(battlesMatch[1], 10)
          : 1;
        const responseShards = (
          (response?.rewards?.data?.shards ?? []) as PostFightShards
        ).filter((shard) =>
          this.trackableRarities.includes(shard.rarity as TrackableRarity)
        );
        const dropsByGirlId = new Map<number, PostFightShard>();
        responseShards.forEach((shard) => {
          dropsByGirlId.set(shard.id_girl, shard);
        });

        const state =
          legendaryMythicTrackingStorageHandler.getCurrentTrackingState();
        const trackedGirlIds = Array.isArray(state.girlIds)
          ? [...state.girlIds]
          : [];
        if (!trackedGirlIds.length) {
          this.shouldTrackShards = false;
          return;
        }

        const completedGirlIds: number[] = [];

        trackedGirlIds.forEach((id_girl) => {
          const existingRecord =
            legendaryMythicTrackingStorageHandler.getTrackedGirl(id_girl);
          const shardDrop = dropsByGirlId.get(id_girl);

          if (!existingRecord) {
            return;
          }

          const updatedRecord: TrackedGirl = {
            name: existingRecord.name,
            ico: existingRecord.ico,
            rarity: existingRecord.rarity,
            number_fight: existingRecord.number_fight + number_of_battles,
            begin_shards_count: existingRecord?.begin_shards_count,
            end_shards_count: existingRecord?.end_shards_count,
          };

          if (shardDrop) {
            if (updatedRecord.begin_shards_count === undefined) {
              updatedRecord.begin_shards_count = shardDrop.previous_value;
            }
            updatedRecord.end_shards_count = shardDrop.value;

            if (shardDrop.is_girl_owned) {
              completedGirlIds.push(id_girl);
            }
          }

          legendaryMythicTrackingStorageHandler.upsertTrackedGirl(
            id_girl,
            updatedRecord
          );
        });

        if (completedGirlIds.length) {
          const remainingGirlIds = trackedGirlIds.filter(
            (id) => !completedGirlIds.includes(id)
          );

          if (remainingGirlIds.length === 0) {
            legendaryMythicTrackingStorageHandler.setCurrentTrackingState(-1);
            this.shouldTrackShards = false;
          } else {
            legendaryMythicTrackingStorageHandler.setCurrentTrackingState(
              state.trollID,
              remainingGirlIds
            );
          }
        }
      }
    });
  }
  handlePreBattlePage() {
    const opponentFighter =
      unsafeWindow.opponent_fighter as VillainPreBattle;
    if (!opponentFighter) {
      return;
    }
    const trackedShards = opponentFighter.rewards.data.shards?.filter(
      (shard) => this.trackableRarities.includes(shard.rarity as TrackableRarity)
    );
    if (!trackedShards || trackedShards.length === 0) {
      legendaryMythicTrackingStorageHandler.setCurrentTrackingState(-1);
      this.shouldTrackShards = false;
      return;
    }
    const trackedGirlIds: number[] = [];
    trackedShards.forEach((shard) => {
      trackedGirlIds.push(shard.id_girl);
      const existingTrackedGirl =
        legendaryMythicTrackingStorageHandler.getTrackedGirl(shard.id_girl);
      if (existingTrackedGirl) {
        return;
      }
      const updatedRecord: TrackedGirl = {
        name: shard.name,
        ico: shard.ico,
        rarity: shard.rarity as TrackableRarity,
        number_fight: 0,
      };
      legendaryMythicTrackingStorageHandler.upsertTrackedGirl(
        shard.id_girl,
        updatedRecord
      );
    });
    this.shouldTrackShards = true;
    legendaryMythicTrackingStorageHandler.setCurrentTrackingState(
      opponentFighter.player.id_fighter,
      trackedGirlIds
    );
  }
}
