import { AlwaysRunningModule } from "../types/AlwaysRunningModules";
import { LeagueOpponentIncomplete } from "../types/GameTypes";
import { GlobalStorageHandler, PlayerStorageHandler } from "../utils/StorageHandler";

export default class PlayerLeagueTracking extends AlwaysRunningModule {
  static shouldRun() {
    return location.pathname === "/leagues.html";
  }
  run() {
    if (this.hasRun || !PlayerLeagueTracking.shouldRun()) {
      return;
    }
    this.hasRun = true;
    console.log("PlayerLeagueTracking module running");
    this.syncPlayerLeagueRank();
  }
  syncPlayerLeagueRank() {
    const currentLeagueTier = unsafeWindow.current_tier_number as number | undefined;
    if (currentLeagueTier === undefined) {
      return;
    }
    const opponentsList = unsafeWindow.opponents_list as
      | Array<LeagueOpponentIncomplete>
      | undefined;
    if (!opponentsList) return;
    //opponents_list.find((a) => a.match_history_sorting === -1)
    const player = opponentsList.find((a) => a.player.id_fighter === shared.Hero.infos.id);
    if (!player) {
      return;
    }
    PlayerStorageHandler.setPlayerLeagueRank({
      league: currentLeagueTier,
      rank: player.place,
    });
  }
}
