import { LeagueOpponentIncomplete } from "../types/GameTypes";
import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { GlobalStorageHandler, LeagueStorageHandler } from "../utils/StorageHandler";

declare const opponents_list: Array<LeagueOpponentIncomplete>;
declare const season_end_at: number;
declare const league_rewards: any; // don't care

export default class LeagueOpponentHistory extends HHModule {
  readonly configSchema = {
    baseKey: "leagueOpponentHistory",
    label: "League : Show history of opponents (click on the row to refresh, only looks for highest league)",
    default: true,
  };
  leaguePlayerRecord:
    | Array<{
        bestPlace: number;
        timesReached: number;
        checkExpiresAt: number;
      }>
    | undefined;
  updatedPlayerRecordsThisSession: Set<number> = new Set();

  shouldRun() {
    return location.pathname.includes("/leagues.html");
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.injectCSS();
    this.leaguePlayerRecord = LeagueStorageHandler.getLeaguePlayerRecord();
    HHPlusPlusReplacer.doWhenSelectorAvailable(".league_table", () => {
      this.applyRankingsToOpponentLists();
      this.startObserverClickOnTable();
      this.applyRankingsToTable();
    });
    $(document).on("league:table-sorted", () => {
      this.startObserverClickOnTable();
      this.applyRankingsToTable();
    });
  }
  async injectCSS() {
    const css = require("./css/LeagueOpponentHistory.css").default;
    GM.addStyle(css);
  }
  applyRankingsToOpponentLists() {
    if (this.leaguePlayerRecord === undefined) {
      return;
    }
    opponents_list.forEach((opponent) => {
      const opponentId = opponent.player.id_fighter;
      const record = this.leaguePlayerRecord![opponentId];
      if (record) {
        opponent.Several_QoL = {
          chechExpiresAt: record.checkExpiresAt,
          bestPlace: record.bestPlace,
          timesReached: record.timesReached,
        };
      }
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
        if (
          selectedOpponent.Several_QoL &&
          selectedOpponent.Several_QoL.chechExpiresAt > server_now_ts
        ) {
          return;
        }
        if (
          self.updatedPlayerRecordsThisSession.has(
            selectedOpponent.player.id_fighter
          )
        ) {
          return;
        }
        self.sendRequestAndAnalyzeOpponent(
          selectedOpponent.player.id_fighter,
          $(this)
        );
      }
    );
  }
  sendRequestAndAnalyzeOpponent(
    opponentId: number,
    $opponentRow: JQuery<HTMLElement>
  ) {
    const payload = {
      action: "fetch_hero",
      id: "profile",
      preview: false,
      player_id: opponentId,
    };
    const highestLeague = Object.keys(league_rewards).length;
    const D3Placement = new RegExp(
      `<img src="https:\\/\\/.*?\\/pictures\\/design\\/leagues\\/${highestLeague}\\.png">\\n\\s*?<div class=\\"tier-stats\\">\\n\\s*?<div>Best place:\\s*<span>(\\d+)<sup>[^<]+<\\/sup><\\/span><\\/div>[\\s\\S]*?<div>Times reached: <span>(\\d+)<\\/span><\\/div>`,
      "g"
    );
    shared.general.hh_ajax(
      payload,
      (response: { html: string; success: boolean }) => {
        const match = D3Placement.exec(response.html);
        const bestPlace = match ? parseInt(match[1]) : null;
        const timesReached = match ? parseInt(match[2]) : null;
        this.updatedPlayerRecordsThisSession.add(opponentId);
        if (!bestPlace || !timesReached) {
          console.warn(
            `Could not find league ${highestLeague} placement info for opponent id `,
            opponentId
          );
          return;
        }
        const existingPlayerRecord = this.leaguePlayerRecord![opponentId];
        if (
          existingPlayerRecord &&
          existingPlayerRecord.bestPlace === bestPlace &&
          existingPlayerRecord.timesReached === timesReached
        ) {
          return;
        }

        this.updateOpponentRecord(opponentId, bestPlace, timesReached);
        $opponentRow
          .children("[column='nickname']")
          .find(".several-qol-bestrank-timesreached")
          .remove();
        $opponentRow
          .children("[column='nickname']")
          .append(this.generateRankHtml(bestPlace, timesReached));
      }
    );
  }
  updateOpponentRecord(
    opponentId: number,
    bestPlace: number,
    timesReached: number
  ) {
    this.leaguePlayerRecord![opponentId] = {
      bestPlace: bestPlace,
      timesReached: timesReached,
      checkExpiresAt: server_now_ts + season_end_at + 10, // +10 to avoid edge cases
    };
    LeagueStorageHandler.setLeaguePLayerRecord(this.leaguePlayerRecord!);
  }
  applyRankingsToTable() {
    const allRows = $(".data-row.body-row");
    if (this.leaguePlayerRecord === undefined) {
      return;
    }
    allRows.each((_, row) => {
      const place = parseInt($(row).children("[column='place']").text().trim());
      if (!place) return;
      const opponent = opponents_list.find(
        (opponents) => opponents.place === place
      );
      if (!opponent) return;
      const opponentId = opponent.player.id_fighter;
      const record = this.leaguePlayerRecord![opponentId];
      if (
        record &&
        !$(row)
          .children("[column='nickname']")
          .find(".several-qol-bestrank-timesreached").length
      ) {
        $(row)
          .children("[column='nickname']")
          .append(this.generateRankHtml(record.bestPlace, record.timesReached));
      }
    });
  }
  generateRankHtml(bestPlace: number, timesReached: number) {
    const $divBestRankTimesReached = $(
      `<div class="several-qol-bestrank-timesreached"></div>`
    );
    const $rankContainer = $(
      `<span class="rank-container ${this.generateRankClass(
        bestPlace
      )}">${bestPlace}</span>`
    );
    const $timesReached = $(
      `<span class="times-reached">x${timesReached}</span>`
    );
    $divBestRankTimesReached.prepend($rankContainer);
    $divBestRankTimesReached.append($timesReached);
    return $divBestRankTimesReached;
  }
  generateRankClass(bestPlace: number): string {
    if (bestPlace == 1) {
      return "several-qol-top1";
    } else if (bestPlace <= 4) {
      return "several-qol-top4";
    } else if (bestPlace <= 15) {
      return "several-qol-top15";
    } else if (bestPlace <= 30) {
      return "several-qol-top30";
    } else {
      return "several-qol-top30plus";
    }
  }
}
