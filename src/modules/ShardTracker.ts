import type {
  PostFightShard,
  PostFightShards,
  VillainPreBattle,
} from "../types/GameTypes/villains";
import type { TrackedGirl } from "../types/ShardTracker";
import { HHModule } from "../types/HH++";
import { ShardTrackerStorageHandler } from "../utils/StorageHandler";
import type { GirlID, GirlRarity } from "../types/GameTypes";

export default class ShardTracker extends HHModule {
  readonly configSchema = {
    baseKey: "shardTracker",
    label:
      "<span tooltip='No way to see what you tracked for now,will be released later'>Tracks your Legendary & Mythic drops from Villains</span>",
    default: true,
  };
  static shouldRun() {
    return (
      location.pathname.includes("/troll-pre-battle.html") ||
      location.pathname.includes("/troll-battle.html")
    );
  }
  shouldTrackShards = false;
  // XXX could be made configurable
  readonly trackedRarities: Array<GirlRarity> = ["mythic", "legendary"];
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
        ).filter((shard) => this.trackedRarities.includes(shard.rarity));
        const dropsByGirlId = new Map<GirlID, PostFightShard>();
        responseShards.forEach((shard) => {
          dropsByGirlId.set(shard.id_girl, shard);
        });

        const state = ShardTrackerStorageHandler.getCurrentTrackingState();
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

          const updatedRecord: TrackedGirl = { ...existingRecord };
          // TODO: (partially) add fights to skin if girl is owned (or just obtained)
          updatedRecord.number_fight += number_of_battles;

          if (shardDrop) {
            updatedRecord.last_shards_count = shardDrop.value;

            if (shardDrop.is_girl_owned) {
              completedGirlIds.push(id_girl);
            }
          }

          ShardTrackerStorageHandler.upsertTrackedGirl(id_girl, updatedRecord);
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
    const opponentFighter = unsafeWindow.opponent_fighter as VillainPreBattle;
    if (!opponentFighter || !opponentFighter.rewards.girls_plain) {
      return;
    }
    const trackedGirlsPlain = opponentFighter.rewards.girls_plain.filter(
      (girl) => {
        return (
          this.trackedRarities.includes(girl.rarity) && // check rarity
          (!girl.is_girl_owned || // check if girl is not owned or has unowned skins
            girl.grade_skins?.some((skin) => skin.is_owned === false))
        );
      }
    );
    if (!trackedGirlsPlain || trackedGirlsPlain.length === 0) {
      ShardTrackerStorageHandler.setCurrentTrackingState(-1);
      this.shouldTrackShards = false;
      return;
    }
    const trackedGirlIds: GirlID[] = [];
    trackedGirlsPlain.forEach((girl_plain) => {
      trackedGirlIds.push(girl_plain.id_girl);
      // have to get girl shard info for name etc
      const girlShards = opponentFighter.rewards.data.shards?.find(
        (shard) => shard.id_girl === girl_plain.id_girl
      );
      if (!girlShards) {
        return;
      }
      const existingTrackedGirl = ShardTrackerStorageHandler.getTrackedGirl(
        girl_plain.id_girl
      );
      if (existingTrackedGirl) {
        if (girl_plain.grade_skins) {
          const newSkinsTracked: TrackedGirl["skins"] = [];
          girl_plain.grade_skins.forEach((skin) => { // important to keep the shown order
            const isSkinTracked =
              existingTrackedGirl.skins &&
              existingTrackedGirl.skins.find(
                (trackedSkin) => trackedSkin.ico_path === skin.ico_path
              );
            if (!isSkinTracked && skin.is_owned === false) {
              newSkinsTracked.push({
                ico_path: skin.ico_path,
                number_fight: 0,
              });
            }
            else if(isSkinTracked){
              newSkinsTracked.push(existingTrackedGirl.skins!.find((trackedSkin) => trackedSkin.ico_path === skin.ico_path)!);
            }
          });
          if (newSkinsTracked.length) {
            existingTrackedGirl.skins = newSkinsTracked;
            ShardTrackerStorageHandler.upsertTrackedGirl(girl_plain.id_girl,existingTrackedGirl)
          }
        }
        return;
      }
      const trackedGirlRecord: TrackedGirl = {
        name: girlShards.name,
        ico: girlShards.ico,
        rarity: girlShards.rarity,
        number_fight: 0,
        dropped_shards: 0,
        grade: girlShards.grade_offsets.static.length - 1,
      };
      if (girl_plain.grade_skins) {
        const girlSkins = girl_plain.grade_skins.filter((skin) => {
          return skin.is_owned === false;
        });
        if (girlSkins.length) {
          trackedGirlRecord.skins = girlSkins.map((skin) => ({
            ico_path: skin.ico_path,
            number_fight: 0,
          }));
        }
      }
      ShardTrackerStorageHandler.upsertTrackedGirl(
        girl_plain.id_girl,
        trackedGirlRecord
      );
    });
    this.shouldTrackShards = true;
    ShardTrackerStorageHandler.setCurrentTrackingState(
      opponentFighter.player.id_fighter,
      trackedGirlIds
    );
  }
}
