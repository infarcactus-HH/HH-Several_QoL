import type {
  DoBattlesTrollsResponse,
  PostFightShard,
  VillainPreBattle,
} from "../types/GameTypes/villains";
import type { TrackedGirl } from "../types/ShardTracker";
import { HHModule } from "../types/HH++";
import { ShardTrackerStorageHandler } from "../utils/StorageHandler";
import type { GirlID, GirlRarity } from "../types/GameTypes";
import { GradeSkins } from "../types/GameTypes/girls";

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
      this.handleBattlePage();
    }
    if (!this.shouldTrackShards) {
      return;
    }
    const currentTrackedGirlIds =
      ShardTrackerStorageHandler.getCurrentTrackingState().girlIds;
    if (!currentTrackedGirlIds.length) {
      return;
    }
    console.log("ShardTracker module is running.");
    this.hookTrollAjaxComplete();
  }
  hookTrollAjaxComplete() {
    $(document).ajaxComplete((_event, xhr, settings) => {
      if (
        this.shouldTrackShards &&
        typeof settings?.data === "string" &&
        settings.data.includes("action=do_battles_trolls")
      ) {
        const response = xhr.responseJSON as DoBattlesTrollsResponse;
        if (!response || !response.rewards) {
          return;
        }
        console.log("ShardTracker response data:", { response });
        const battlesMatch = settings.data.match(/number_of_battles=(\d+)/);
        const number_of_battles = battlesMatch
          ? parseInt(battlesMatch[1], 10)
          : 1;
        const responseShards = (response.rewards.data.shards ?? []).filter(
          (shard) => this.trackedRarities.includes(shard.rarity)
        );
        const dropsByGirlId = new Map<GirlID, PostFightShard>(
          responseShards.map((shard) => [shard.id_girl, shard])
        );

        const state = ShardTrackerStorageHandler.getCurrentTrackingState();
        const trackedGirlIds = state.girlIds;
        if (!trackedGirlIds.length) {
          this.shouldTrackShards = false;
          return;
        }

        const completedGirlIds: GirlID[] = [];
        // Too complicated to know how many fights are for 1 girl when there are multiple tracked at the same time
        // so we just add all fights to all tracked
        trackedGirlIds.forEach((girlID) => {
          const trackedGirl = ShardTrackerStorageHandler.getTrackedGirl(girlID);
          if (!trackedGirl) {
            return;
          }
          const dropInfo = dropsByGirlId.get(girlID);
          if (!dropInfo) {
            addFightsToTrackedGirl(trackedGirl, number_of_battles, girlID);
            return;
          }
          let updatedTrackedGirl: TrackedGirl | undefined;
          if (dropInfo.value !== 100 || !trackedGirl.skins) {
            // No checks needed for skins or anything :D
            noSkinUpdateTrackedGirl(trackedGirl, dropInfo, number_of_battles);
            return;
          } else if (
            response.rewards?.data.girls?.find(
              (girl) => girl.id_girl === girlID
            )
          ) {
            updatedTrackedGirl = girlAndMaybeSkinUpdateTrackedGirl(
              trackedGirl,
              dropInfo,
              number_of_battles
            );
          } else {
            // 100% sure it's only skin shards
            if (
              !response.rewards?.data.grade_skins?.filter((skin) => {
                return skin.id_girl === girlID;
              })
            ) {
              // No skin dropped, just update obtained shards count
              updatedTrackedGirl = simpleSkinUpdateTrackedGirl(
                trackedGirl,
                dropInfo,
                number_of_battles
              );
            } else {
              const skinsDropped = response.rewards.data.grade_skins.filter(
                (skin) => {
                  return skin.id_girl === girlID;
                }
              );
              updatedTrackedGirl = updateMultipleSkinsTrackedGirl(
                trackedGirl,
                dropInfo,
                number_of_battles,
                skinsDropped
              );
            }
          }
          if (updatedTrackedGirl) {
            if (
              updatedTrackedGirl.last_shards_count === 100 &&
              (!updatedTrackedGirl.skins ||
                updatedTrackedGirl.skins.every((skin) => skin.is_owned))
            ) {
              completedGirlIds.push(girlID);
            }
          }
        });
        if (completedGirlIds.length) {
          const state = ShardTrackerStorageHandler.getCurrentTrackingState();
          const newTrackedGirlIds = state.girlIds.filter(
            (id) => !completedGirlIds.includes(id)
          );
          if (newTrackedGirlIds.length === 0) {
            this.shouldTrackShards = false;
            ShardTrackerStorageHandler.setCurrentTrackingState(-1);
          } else {
            ShardTrackerStorageHandler.setCurrentTrackingState(
              state.trollID,
              newTrackedGirlIds
            );
          }
        }
      }
    });
    function addFightsToTrackedGirl(
      trackedGirl: TrackedGirl,
      nbFights: number,
      girlID: GirlID
    ) {
      if (trackedGirl.last_shards_count === 100) {
        if (
          !trackedGirl.skins ||
          trackedGirl.skins.every((skin) => skin.is_owned)
        ) {
          return;
        }
        trackedGirl.skins.find((skin) => !skin.is_owned)!.number_fight +=
          nbFights;
      }
      trackedGirl.number_fight += nbFights;
      ShardTrackerStorageHandler.upsertTrackedGirl(girlID, trackedGirl);
      return trackedGirl;
    }
    function noSkinUpdateTrackedGirl(
      trackedGirl: TrackedGirl,
      dropInfo: PostFightShard,
      number_of_battles: number
    ) {
      trackedGirl.last_shards_count = dropInfo.value;
      trackedGirl.number_fight += number_of_battles;
      const gainedShards = dropInfo.value - dropInfo.previous_value;
      trackedGirl.dropped_shards += gainedShards;
      ShardTrackerStorageHandler.upsertTrackedGirl(
        dropInfo.id_girl,
        trackedGirl
      );
      return trackedGirl;
    }
    function simpleSkinUpdateTrackedGirl(
      trackedGirl: TrackedGirl,
      dropInfo: PostFightShard,
      number_of_battles: number
    ) {
      const currentTrackedSkin = trackedGirl.skins!.find(
        (skin) => !skin.is_owned
      );
      if (!currentTrackedSkin) {
        return;
      }
      currentTrackedSkin.number_fight += number_of_battles;
      const gainedShards = dropInfo.value - dropInfo.previous_value;
      currentTrackedSkin.dropped_shards = gainedShards;
      ShardTrackerStorageHandler.upsertTrackedGirl(
        dropInfo.id_girl,
        trackedGirl
      );
      return trackedGirl;
    }
    function girlAndMaybeSkinUpdateTrackedGirl(
      trackedGirl: TrackedGirl,
      dropInfo: PostFightShard,
      number_of_battles: number
    ) {
      const lastShardCount = getGirlLastShardCount(trackedGirl, dropInfo);
      if (lastShardCount !== undefined) {
        const gainedGirlShards = 100 - lastShardCount;
        let skinShardsPool = lastShardCount - dropInfo.previous_value;
        const totalShards = gainedGirlShards + skinShardsPool;
        trackedGirl.dropped_shards = 100;
        trackedGirl.number_fight +=
          number_of_battles === 1
            ? 1
            : Math.round((number_of_battles * gainedGirlShards) / totalShards);
        while (skinShardsPool > 0) {
          // in case of multi skin drops, shouldn't be an issue doing it like this
          const skinsShardsToFill = Math.min(33, skinShardsPool);
          skinShardsPool -= skinsShardsToFill;
          const currentTrackedSkin = trackedGirl.skins!.find(
            (skin) => !skin.is_owned
          )!;
          currentTrackedSkin.dropped_shards = skinsShardsToFill;
          currentTrackedSkin.number_fight +=
            number_of_battles === 1
              ? 0
              : number_of_battles -
                Math.round(
                  (number_of_battles * skinsShardsToFill) / totalShards
                );
        }
      } else {
        // Not yet implemented
      }
      return trackedGirl;
    }
    function getGirlLastShardCount(
      trackedGirl: TrackedGirl,
      dropInfo: PostFightShard
    ): number | undefined {
      //for an eventual future use ?, maybe even asking the user if we need to fetch the harem page to see the shard count ?
      // Or make an option for the user to have a fetch option on battle page to update last shard count
      if (trackedGirl.last_shards_count !== undefined) {
        if (trackedGirl.last_shards_count >= dropInfo.previous_value) {
          return trackedGirl.last_shards_count;
        }
        // This here is a problem, as we can assume our record is old :(
      }
      return;
    }
    function updateMultipleSkinsTrackedGirl(
      trackedGirl: TrackedGirl,
      dropInfo: PostFightShard,
      number_of_battles: number,
      skinsDropped: GradeSkins
    ) {
      let skinShardsPool = dropInfo.value - dropInfo.previous_value;
      const totalSkinShardsDropped = skinShardsPool;
      skinsDropped.forEach((skinDrop) => {
        const currentTrackedSkin = trackedGirl.skins!.find(
          (s) => s.ico_path === skinDrop.ico_path
        );
        const droppedShardsForThisSkin =
          skinDrop.shards_added - skinDrop.previous_skin_shards;
        const nbFightsForThisSkin = Math.round(
          number_of_battles *
            (droppedShardsForThisSkin / totalSkinShardsDropped)
        );
        skinShardsPool -= droppedShardsForThisSkin;
        if (!currentTrackedSkin) {
          alert(
            "ShardTracker: encountered a skin drop that is not tracked, this should not happen."
          );
          const newSkinTracked = {
            ico_path: skinDrop.ico_path,
            number_fight: nbFightsForThisSkin,
            is_owned: skinDrop.is_owned,
            dropped_shards: droppedShardsForThisSkin,
          };
          trackedGirl.skins!.push(newSkinTracked);
          return;
        } else {
          currentTrackedSkin.number_fight += nbFightsForThisSkin;
          currentTrackedSkin.dropped_shards =
            (currentTrackedSkin.dropped_shards ?? 0) + droppedShardsForThisSkin;
        }
      });
      if (skinShardsPool > 33) {
        alert(
          "ShardTracker: encountered more skin shards dropped than possible, this should not happen."
        );
      }
      while (skinShardsPool > 0) {
        const currentTrackedSkin = trackedGirl.skins!.find((s) => !s.is_owned);
        if (!currentTrackedSkin) {
          break;
        }
        const shardsToAdd = Math.min(
          33 - (currentTrackedSkin.dropped_shards ?? 0),
          skinShardsPool
        );
        currentTrackedSkin.dropped_shards =
          (currentTrackedSkin.dropped_shards ?? 0) + shardsToAdd;
        const fightsToAdd = Math.round(
          number_of_battles * (shardsToAdd / totalSkinShardsDropped)
        );
        currentTrackedSkin.number_fight += fightsToAdd;
        skinShardsPool -= shardsToAdd;
      }
      ShardTrackerStorageHandler.upsertTrackedGirl(
        dropInfo.id_girl,
        trackedGirl
      );
      return trackedGirl;
    }
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
    this.shouldTrackShards = true;
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
          if (
            // check if all skins are already tracked/owned
            girl_plain.grade_skins.every((skin) => {
              return (
                existingTrackedGirl.skins?.some(
                  (trackedSkin) => trackedSkin.ico_path === skin.ico_path
                ) || skin.is_owned
              );
            })
          ) {
            return;
          }
          const newSkinsTracked: TrackedGirl["skins"] = [];
          girl_plain.grade_skins.forEach((skin) => {
            // important to keep the shown order
            const isSkinTracked =
              existingTrackedGirl.skins &&
              existingTrackedGirl.skins.find(
                (trackedSkin) => trackedSkin.ico_path === skin.ico_path
              );
            if (!isSkinTracked && skin.is_owned === false) {
              newSkinsTracked.push({
                ico_path: skin.ico_path,
                number_fight: 0,
                is_owned: skin.is_owned,
              });
            } else if (isSkinTracked) {
              newSkinsTracked.push(
                existingTrackedGirl.skins!.find(
                  (trackedSkin) => trackedSkin.ico_path === skin.ico_path
                )!
              );
            }
          });
          if (newSkinsTracked.length) {
            existingTrackedGirl.skins = newSkinsTracked;
            ShardTrackerStorageHandler.upsertTrackedGirl(
              girl_plain.id_girl,
              existingTrackedGirl
            );
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
      if (girlShards.is_girl_owned) {
        trackedGirlRecord.last_shards_count = 100;
      }
      if (girl_plain.grade_skins) {
        const girlSkins = girl_plain.grade_skins.filter((skin) => {
          return skin.is_owned === false;
        });
        if (girlSkins.length) {
          trackedGirlRecord.skins = girlSkins.map((skin) => ({
            ico_path: skin.ico_path,
            number_fight: 0,
            is_owned: skin.is_owned, // will be false here
          }));
        }
      }
      ShardTrackerStorageHandler.upsertTrackedGirl(
        girl_plain.id_girl,
        trackedGirlRecord
      );
    });
    ShardTrackerStorageHandler.setCurrentTrackingState(
      opponentFighter.player.id_fighter,
      trackedGirlIds
    );
  }
  handleBattlePage() {
    const currentTrackingState =
      ShardTrackerStorageHandler.getCurrentTrackingState();
    if (
      location.search.includes(`id_opponent=${currentTrackingState.trollID}`) &&
      currentTrackingState.girlIds.length !== 0
    ) {
      this.shouldTrackShards = true;
    }
  }
}
