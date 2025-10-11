import { LeagueOpponentIncomplete } from "../types/GameTypes";
import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { StorageHandler } from "../utils/StorageHandler";

const configSchema = {
  baseKey: "leagueOponentHistory",
  label: "Show history of opponents in league (click on the row to refresh)",
  default: true,
} as const;

declare const opponents_list: Array<LeagueOpponentIncomplete>;
declare const season_end_at: number;

export default class LeagueOpponentHistory extends HHModule {
  leaguePlayerRecord: Array<{
    bestPlace: number;
    timesReached: number;
    checkExpiresAt: number;
  }> = StorageHandler.getLeaguePlayerRecord();
  updatedPlayerRecordsThisSession: Set<number> = new Set();
  constructor() {
    super(configSchema);
  }
  shouldRun() {
    return location.pathname.includes("/leagues.html");
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    HHPlusPlusReplacer.doWhenSelectorAvailable(".league_table", () => {
      this.startObserverClickOnTable();
      this.applyRankingsToTable();
    });
    $(document).on("league:table-sorted", () => {
      this.startObserverClickOnTable();
      this.applyRankingsToTable();
    });
  }
  startObserverClickOnTable() {
    const self = this;
    $(".league_table > .data-list > .body-row").on(
      "click.SeveralQoL",
      function () {
        const place = parseInt(
          $(this).children("[column='place']").text().trim()
        );
        const selectedOpponent = opponents_list.find(
          (opponents) => opponents.place === place
        );
        if (!selectedOpponent) {
          console.warn("Could not find opponent for place ", place);
          return;
        }
        self.sendRequestAndAnalyzeOpponent(selectedOpponent.player.id_fighter, place);
      }
    );
  }
  sendRequestAndAnalyzeOpponent(opponentId: number,opponentRank: number) {
    if (this.updatedPlayerRecordsThisSession.has(opponentId)) {
      return;
    }
    if(this.leaguePlayerRecord[opponentId] && this.leaguePlayerRecord[opponentId].checkExpiresAt > server_now_ts){
      return;
    }
    const payload = {
      action: "fetch_hero",
      id: "profile",
      preview: false,
      player_id: opponentId,
    };
    const D3Placement =
      /<div class="history-independent-tier">[\s\S]*?<img src="https:\/\/hh\.hh-content\.com\/pictures\/design\/leagues\/9\.png">[\s\S]*?<div>Best place:\s*<span>(\d+)<sup>[^<]+<\/sup><\/span><\/div>[\s\S]*?<div>Times reached: <span>(\d+)<\/span><\/div>/g;
    shared.general.hh_ajax(
      payload,
      (response: { html: string; success: boolean }) => {
        const match = D3Placement.exec(response.html);
        const bestPlace = match ? parseInt(match[1]) : null;
        const timesReached = match ? parseInt(match[2]) : null;
        if (!bestPlace || !timesReached) {
          console.warn(
            "Could not find D3 placement info for opponent id ",
            opponentId
          );
          return;
        }
        this.updatedPlayerRecordsThisSession.add(opponentId);
        const existingPlayerRecord = this.leaguePlayerRecord[opponentId];
        if (existingPlayerRecord) {
          if (
            existingPlayerRecord.bestPlace !== bestPlace ||
            existingPlayerRecord.timesReached !== timesReached
          ) {
            this.updateOpponentRecord(opponentId, bestPlace, timesReached,opponentRank);
            return;
          }
        } else {
          this.updateOpponentRecord(opponentId, bestPlace, timesReached,opponentRank);
          return;
        }
      }
    );
  }
  updateOpponentRecord(
    opponentId: number,
    bestPlace: number,
    timesReached: number,
    opponentRank: number
  ) {
    this.leaguePlayerRecord[opponentId] = {
      bestPlace: bestPlace,
      timesReached: timesReached,
      checkExpiresAt: server_now_ts + season_end_at + 10,
    };
    StorageHandler.setLeaguePLayerRecord(this.leaguePlayerRecord);
  }
  applyRankingsToTable() {
    const allRows = $(".data-row.body-row");
    const self = this;
    allRows.each((_, row) => {
      const place = parseInt(
        $(row).children("[column='place']").text().trim()
      );
      if(!place) return;
      const opponent = opponents_list.find(
        (opponents) => opponents.place === place
      );
      if (!opponent) return;
      const opponentId = opponent.player.id_fighter;
      const record = self.leaguePlayerRecord[opponentId];
      if (record) {
        console.log("Found record for opponent ", opponentId, record);
        $(row).children("[column='nickname']").attr(
          "tooltip",
          `Best place: ${record.bestPlace}, Times reached: ${record.timesReached}`
        );
      }
    })
  }
}
