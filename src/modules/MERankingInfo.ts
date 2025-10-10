import type {
  MERankingHeroData,
  MERankingLeaderboardEntryIncomplete,
} from "../types/GameTypes";
import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

const configSchema = {
  baseKey: "meRankingInfo",
  label: "Adds info about rankings in seasonal event",
  default: true,
};

export default class MERankingInfo extends HHModule {
  heroData: MERankingHeroData | null = null;
  leaderboardData: Array<MERankingLeaderboardEntryIncomplete> | null = null;
  constructor() {
    super(configSchema);
  }
  shouldRun() {
    return location.pathname.includes("seasonal.html");
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.injectCSS();
    this.hookAjaxRequest();
  }
  async injectCSS() {
    const css = require("./css/MERankingInfo.css").default;
    GM.addStyle(css);
  }
  hookAjaxRequest() {
    $(document).ajaxComplete((event, xhr, settings) => {
      if (settings?.data === "action=leaderboard&feature=seasonal_event_top") {
        this.heroData = xhr.responseJSON?.hero_data;
        this.leaderboardData = xhr.responseJSON?.leaderboard;
        this.hookSpecialHeroRow();
      }
    });
  }

  hookSpecialHeroRow() {
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      "#leaderboard_holder > #outer-hero-row",
      () => {
        console.log("found special hero row");
        const rankingInfoTooltip = this.createTooltipTableRankingContent();
        const $rankingInfo = $(
          `<img class="me-leaderboard-info" src="https://hh.hh-content.com/leagues/ic_rankup.png" tooltip></img>`
        );
        $rankingInfo.attr("hh_title", rankingInfoTooltip);
        $("#leaderboard_holder > #outer-hero-row").append($rankingInfo);
      }
    );
  }

  createTooltipTableRankingContent() : string {
    if (!this.heroData || !this.leaderboardData) {
      return "";
    }

    const rankThresholds = [10, 50, 100, 250, 500, 1000];
    const currentRank = this.heroData.rank;
    const currentPotions = this.heroData.potions;

    // Build tooltip content as a table
    let tooltipContent = `<div class="me-ranking-tooltip">`;
    tooltipContent += `<table style="border-collapse: collapse; width: 100%;">`;
    tooltipContent += `<thead><tr>`;
    tooltipContent += `<th>Rank</th>`;
    tooltipContent += `<th>Resource</th>`;
    tooltipContent += `<th>Difference</th>`;
    tooltipContent += `</tr></thead><tbody>`;

    const playerEntry = this.leaderboardData.find(
      (entry) => entry.rank === currentRank
    );

    rankThresholds.forEach((threshold) => {
      // Find the leaderboard entry at this rank
      const leaderboardEntry = this.leaderboardData!.find(
        (entry) => entry.rank === threshold
      );

      const potionsAtRank = leaderboardEntry?.potions ?? "?";
      let diffText = "?";
      let diffColor = "black";
      if (leaderboardEntry) {
        const potionDiff = currentPotions - leaderboardEntry.potions;
        if (potionDiff === 0) {
          const heroId = playerEntry!.id_member;
          const entryId = leaderboardEntry.id_member;
          if (typeof heroId === "number" && typeof entryId === "number") {
            if (heroId < entryId) {
              diffText = "+0 (above)";
              diffColor = "green";
            } else if (heroId > entryId) {
              diffText = "+0 (below)";
              diffColor = "red";
            } else {
              diffText = "= (tie)";
              diffColor = "orange";
            }
          } else {
            diffText = "= (tie)";
            diffColor = "orange";
          }
        } else {
          diffText = potionDiff > 0 ? `+${potionDiff}` : `${potionDiff}`;
          diffColor = potionDiff > 0 ? "green" : "red";
        }
      }

      tooltipContent += `<tr>`;
      tooltipContent += `<td>${threshold}</td>`;
      tooltipContent += `<td>${potionsAtRank}</td>`;
      tooltipContent += `<td style="color: ${diffColor}; font-weight: bold;">${diffText}</td>`;
      tooltipContent += `</tr>`;
    });

    tooltipContent += `</tbody></table></div>`;
    return tooltipContent;
  }
}
