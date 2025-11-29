import { AlwaysRunningModule } from "../types/AlwaysRunningModules";
import { SeasonTiers } from "../types/GameTypes/season";
import { PlayerStorageHandler } from "../utils/StorageHandler";

export default class PlayerSeasonTracking extends AlwaysRunningModule {
  static shouldRun() {
    return location.pathname === "/season.html" || location.pathname === "/season-arena.html";
  }
  run() {
    if (this.hasRun || !PlayerSeasonTracking.shouldRun()) {
      return;
    }
    this.hasRun = true;
    console.log("PlayerSeasonTracking module running");
    this.syncPlayerSeasonInfo();
  }
  syncPlayerSeasonInfo() {
    const seasonMojo = unsafeWindow.season_mojo_s as number | undefined;
    if (seasonMojo === undefined) {
      return;
    }
    const season_tiers = unsafeWindow.season_tiers as SeasonTiers | undefined;
    if (!season_tiers) {
      return;
    }
    const nextTier = season_tiers.find((tier) => {
      return Number(tier.mojo_required) > seasonMojo;
    });
    const previousTier = nextTier
      ? season_tiers[Number(nextTier.tier) - 1]
      : season_tiers[season_tiers.length - 1];
    const previousTierThreshold = Number(previousTier.mojo_required);
    const nextTierThreshold = nextTier ? Number(nextTier.mojo_required) : undefined;
    const storedSeasonName = PlayerStorageHandler.getPlayerSeasonInfo()?.name;
    PlayerStorageHandler.setPlayerSeasonInfo({
      previousTierThreshold,
      nextTierThreshold,
      mojo: seasonMojo,
      name: $("#seasons_tab_title").contents()[0]?.textContent?.trim() || storedSeasonName, // Also works on arena season
    });
  }
}
