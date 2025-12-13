import { AlwaysRunningModule } from "../base";
import { penta_drill_data } from "../types";
import { PlayerStorageHandler } from "../utils/StorageHandler";

export default class PlayerDrillTracking extends AlwaysRunningModule {
  static shouldRun() {
    return location.pathname === "/penta-drill.html";
  }
  run() {
    if (this.hasRun || !PlayerDrillTracking.shouldRun()) {
      return;
    }
    this.hasRun = true;
    console.log("PlayerDrillTracking module running");
    const pentaDrillData = unsafeWindow.penta_drill_data as penta_drill_data | undefined;
    if (!pentaDrillData) {
      return;
    }
    const currentTier = pentaDrillData.progression.tier;
    const currentPotions = pentaDrillData.progression.potions;
    const currentTierPathRewards = pentaDrillData.path_rewards.find(
      (pr) => pr.tier === currentTier,
    )!;
    const nextTierPathRewards = pentaDrillData.path_rewards.find(
      (pr) => pr.tier === currentTier + 1,
    );
    PlayerStorageHandler.setPlayerPentaDrillInfo({
      tier: currentTier,
      potions: currentPotions,
      previousTierThreshold: currentTierPathRewards.potions_required,
      nextTierThreshold: nextTierPathRewards ? nextTierPathRewards.potions_required : undefined,
    });
  }
}
