import type {
  PostFightShard,
  PostFightShards,
  VillainPreBattle,
} from "../types/GameTypes/villains";
import type {
  TrackedGirl,
  TrackableRarity,
} from "../types/ShardTracker";
import { HHModule } from "../types/HH++";
import { ShardTrackerStorageHandler } from "../utils/StorageHandler";
import type { GirlID } from "../types/GameTypes";

export default class ShardTracker extends HHModule {
  readonly configSchema = {
    baseKey: "shardTracker",
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
  readonly trackedRarities : Array<TrackableRarity> = ["mythic", "legendary"];
  run() {
    if (this.hasRun || !ShardTracker.shouldRun()) {
      return;
    }
    this.hasRun = true;
    if (location.pathname === "/troll-pre-battle.html") {
      this.handlePreBattlePage();
    } else {
      const currentTrackedTrollID =
        ShardTrackerStorageHandler.getCurrentTrackingState().trollID;
      if (location.search.includes(`id_opponent=${currentTrackedTrollID}`)) {
        this.shouldTrackShards = true;
      }
    }
    if (!this.shouldTrackShards) {
      return;
    }
    const currentTrackedGirlIds =
      ShardTrackerStorageHandler.getCurrentTrackingState().girlIds;
    if (
      !Array.isArray(currentTrackedGirlIds) ||
      !currentTrackedGirlIds.length
    ) {
      return;
    }
    console.log("ShardTracker module is running.");
    $(document).ajaxComplete((_event, xhr, settings) => {
      if (
        this.shouldTrackShards &&
        typeof settings?.data === "string" &&
        settings.data.includes("action=do_battles_trolls")
      ) {
        console.log("ShardTracker AJAX complete detected:", {
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
          this.trackedRarities.includes(shard.rarity as TrackableRarity)
        );
        const dropsByGirlId = new Map<GirlID, PostFightShard>();
        responseShards.forEach((shard) => {
          dropsByGirlId.set(shard.id_girl, shard);
        });

        const state =
          ShardTrackerStorageHandler.getCurrentTrackingState();
        const trackedGirlIds = Array.isArray(state.girlIds)
          ? [...state.girlIds]
          : [];
        if (!trackedGirlIds.length) {
          this.shouldTrackShards = false;
          return;
        }

        const completedGirlIds: GirlID[] = [];

        trackedGirlIds.forEach((id_girl) => {
          const existingRecord =
            ShardTrackerStorageHandler.getTrackedGirl(id_girl);
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

          ShardTrackerStorageHandler.upsertTrackedGirl(
            id_girl,
            updatedRecord
          );
        });

        if (completedGirlIds.length) {
          const remainingGirlIds = trackedGirlIds.filter(
            (id) => !completedGirlIds.includes(id)
          );

          if (remainingGirlIds.length === 0) {
            ShardTrackerStorageHandler.setCurrentTrackingState(-1);
            this.shouldTrackShards = false;
          } else {
            ShardTrackerStorageHandler.setCurrentTrackingState(
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
    if (!opponentFighter || !opponentFighter.rewards.girls_plain) {
      return;
    }
    const trackedShards = opponentFighter.rewards.data.shards?.filter(
      (shard) => shard.rarity in this.trackedRarities
    );
    if (!trackedShards || trackedShards.length === 0) {
      ShardTrackerStorageHandler.setCurrentTrackingState(-1);
      this.shouldTrackShards = false;
      return;
    }
    const trackedGirlIds: GirlID[] = [];
    trackedShards.forEach((shard) => {
      trackedGirlIds.push(shard.id_girl);
      const existingTrackedGirl =
        ShardTrackerStorageHandler.getTrackedGirl(shard.id_girl);
      if (existingTrackedGirl) {
        return;
      }
      const updatedRecord: TrackedGirl = {
        name: shard.name,
        ico: shard.ico,
        rarity: shard.rarity as TrackableRarity,
        number_fight: 0,
      };
      ShardTrackerStorageHandler.upsertTrackedGirl(
        shard.id_girl,
        updatedRecord
      );
    });
    this.shouldTrackShards = true;
    ShardTrackerStorageHandler.setCurrentTrackingState(
      opponentFighter.player.id_fighter,
      trackedGirlIds
    );
  }
}
