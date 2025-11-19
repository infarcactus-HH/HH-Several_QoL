import type { DoBattlesTrollsResponse, PostFightShard, VillainPreBattle } from "../types/GameTypes/villains";
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
  // YYY: it could, but maybe later x)
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

        const currentTrackingState =
          ShardTrackerStorageHandler.getCurrentTrackingState();
        if (!currentTrackingState.girlIds.length) {
          this.shouldTrackShards = false;
          return;
        }

        const completedGirlIds: GirlID[] = [];
        // Too complicated to know how many fights are for 1 girl when there are multiple tracked at the same time
        // so we just add all fights to all tracked
        // XXX: this makes it sound like a workaround but it isn't. if you do 10
        //   fights and get 3 shards for two girls each, both of them had a drop
        //   rate of 3 in 10. with the same luck and only one girl on the villain
        //   you'd have still gotten 3 shards for her and the fights that dropped
        //   shards for the other girl would have been money. so still 3 in 10.
        // YYY: it is kind of a workaround though, because if you track multiple drops
        //   the rate is still 3/10 for each girls. But you would count the drop for the 
        //   other girl too, in the fights you didn't gain shard for the girl, 
        //   which doesn't make sense. Especially with how the game drops shards
        currentTrackingState.girlIds.forEach((girlID) => {
          const trackedGirl = ShardTrackerStorageHandler.getTrackedGirl(girlID);
          if (!trackedGirl) {
            return;
          }
          const dropInfo = dropsByGirlId.get(girlID);
          if (!dropInfo) {
            // no drops for this girl so only increase number of fights
            addFightsToTrackedGirl(trackedGirl, number_of_battles, girlID);
            return;
          }

          if (dropInfo.previous_value > 100) {
            // shard drop is bugged and unusable
            console.warn('unusable shard drop info:', dropInfo);
            // XXX: this could maybe be salvaged, so far I've only seen it on
            //   rewards where the girl dropped so we could set `previous_value`
            //   to `last_shards_count` if it is known and `value` to 100 to
            //   assume it was just enough to get her (and subtract some more
            //   from `previous_value` in case any skins dropped)
            // YYY: maybe, but it would be annoying if it broke the rest of the logic
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
          const currentTrackingState =
            ShardTrackerStorageHandler.getCurrentTrackingState();
          const newTrackedGirlIds = currentTrackingState.girlIds.filter(
            (id) => !completedGirlIds.includes(id)
          );
          if (newTrackedGirlIds.length === 0) {
            this.shouldTrackShards = false;
            ShardTrackerStorageHandler.setCurrentTrackingState(-1);
          } else {
            ShardTrackerStorageHandler.setCurrentTrackingState(
              currentTrackingState.trollID,
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
      } else {
        trackedGirl.number_fight += nbFights;
      }
      ShardTrackerStorageHandler.upsertTrackedGirl(girlID, trackedGirl);
      return trackedGirl;
    }
    function noSkinUpdateTrackedGirl(
      trackedGirl: TrackedGirl,
      dropInfo: PostFightShard,
      number_of_battles: number
    ) {
      // value can exceed 100 with a 100 drop so it needs to be capped
      trackedGirl.last_shards_count = Math.min(dropInfo.value, 100);
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
      currentTrackedSkin.dropped_shards = dropInfo.value - dropInfo.previous_value;
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
        const fightsGirl =
          number_of_battles === 1
            ? 1
            : Math.round((number_of_battles * gainedGirlShards) / totalShards);
        trackedGirl.number_fight += fightsGirl;
        if (number_of_battles > 1) {
          let fightsAccounted = fightsGirl;
          while (skinShardsPool > 0) {
            // in case of multi skin drops, shouldn't be an issue doing it like this
            const i = trackedGirl.skins!.findIndex(
              (skin) => !skin.is_owned
            )!;
            const lastSkin = i === trackedGirl.skins!.length;
            const currentTrackedSkin = trackedGirl.skins![i];

            const skinsShardsToFill = lastSkin
              ? skinShardsPool
              : Math.min(33, skinShardsPool);
            skinShardsPool -= skinsShardsToFill;
            currentTrackedSkin.dropped_shards = skinsShardsToFill;

            const fightsSkin = lastSkin
              ? number_of_battles - fightsAccounted
              : number_of_battles - Math.round((number_of_battles * skinsShardsToFill) / totalShards);
            currentTrackedSkin.number_fight += fightsSkin;
            fightsAccounted += fightsSkin;
          }
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
      // XXX: in this case we could probably just return `previous_value` plus
      //   whatever info about skin drops we get if `grade_skins` is available
      // YYY: maybe, unsure of how reliable it would be
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
        // XXX: is this necessarily an error? I don't remember if `previous_value`
        //   includes overflow to flowers or not. if it does this is certainly
        //   possible and would only be an error if there is still an unowned
        //   skin left
        // YYY: you can't say is this necessarily an error and on the while loop
        //   below that it should only run once. Because it will only run more than once
        //   When skinShardsPool >= 33 here
        alert(
          "ShardTracker: encountered more skin shards dropped than possible, this should not happen."
        );
      }
      // XXX: this `while` should be an `if` as it should never run more than
      //   once. if it did we would have an additional completed skin that
      //   should have appeared in `skinsDropped`
      // YYY: that's true but it's to cover for the case above
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
            girl.grade_skins?.some((skin) => !skin.is_owned))
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
        updateExistingTrackedGirl(existingTrackedGirl, girl_plain);
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
    function updateExistingTrackedGirl(
      existingTrackedGirl: TrackedGirl,
      girl_plain: (typeof trackedGirlsPlain)[number]
    ) {
      let hasChanges = false; // to avoid unnecessary writes
      if (
        existingTrackedGirl.last_shards_count !== 100 &&
        girl_plain.is_girl_owned
      ) {
        existingTrackedGirl.last_shards_count = 100;
        hasChanges = true;
      }
      // The case where the girl and all skins are owned will never appear as the server won't send it
      if (girl_plain.grade_skins) {
        const newSkinsTracked: TrackedGirl["skins"] = []; // Also needs to include previously tracked skins
        girl_plain.grade_skins.forEach((skin) => {
          // important to keep the shown order
          const skinTracked =
            existingTrackedGirl.skins &&
            existingTrackedGirl.skins.find(
              (trackedSkin) => trackedSkin.ico_path === skin.ico_path
            );
          if (!skinTracked && skin.is_owned === false) {
            newSkinsTracked.push({
              ico_path: skin.ico_path,
              number_fight: 0,
              is_owned: skin.is_owned,
            });
          } else if (skinTracked) {
            if (skinTracked.is_owned !== skin.is_owned) {
              skinTracked.is_owned = skin.is_owned;
              hasChanges = true;
            }
            newSkinsTracked.push(
              existingTrackedGirl.skins!.find(
                (trackedSkin) => trackedSkin.ico_path === skin.ico_path
              )!
            );
          }
        });
        if (hasChanges && newSkinsTracked.length) {
          existingTrackedGirl.skins = newSkinsTracked;
        }
      }
      if (hasChanges) {
        ShardTrackerStorageHandler.upsertTrackedGirl(
          girl_plain.id_girl,
          existingTrackedGirl
        );
      }
    }
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
