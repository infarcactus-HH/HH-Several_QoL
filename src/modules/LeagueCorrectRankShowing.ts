import { LeagueOpponentIncomplete } from "../types/GameTypes";
import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { LeagueStorageHandler } from "../utils/StorageHandler";

export default class LeagueCorrectRankShowing extends HHModule {
  readonly configSchema = {
    baseKey: "leagueCorrectRankShowing",
    label: "<span tooltip='Go to League page to update'>League : Show correct rank on home page</span>",
    default: true,
  };
  static shouldRun() {
    return (
      location.pathname === "/leagues.html" ||
      location.pathname === "/home.html"
    );
  }
  run() {
    if (this.hasRun || !LeagueCorrectRankShowing.shouldRun()) {
      return;
    }
    this.hasRun = true;
    if (location.pathname === "/home.html") {
      this.updateDisplayedRank();
    } else if (location.pathname === "/leagues.html") {
      this.fetchCurrentRank();
    }
  } //GT.design.Rank
  updateDisplayedRank() {
    const currentRank = LeagueStorageHandler.getLeagueCurrentRank();
    if (currentRank === -1) return;
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      `[rel="leaderboard"] .league-rank`,
      ($element) => {
        $element.text(`${GT.design.Rank} ${currentRank}`);
      }
    );
  }
  async fetchCurrentRank() {
    const opponentsList = unsafeWindow.opponents_list as
      | Array<LeagueOpponentIncomplete>
      | undefined;
    if (!opponentsList) return;
    //opponents_list.find((a) => a.match_history_sorting === -1)
    const player = opponentsList.find(
      (a) => a.player.id_fighter === shared.Hero.infos.id
    );
    if (!player) return;
    LeagueStorageHandler.setLeagueCurrentRank(player.place);
  }
}
