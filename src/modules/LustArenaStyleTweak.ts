import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import LustArenaStyleTweakCss from "../css/modules/LustArenaStyleTweak.css";
import html from "../utils/html";
import { PlayerStorageHandler } from "../utils/StorageHandler";

export default class LustArenaStyleTweak extends HHModule {
  readonly configSchema = {
    baseKey: "lustArenaStyleTweak",
    label: "Lust Arena : Style tweaks",
    default: true,
  };
  static shouldRun() {
    return location.pathname === "/home.html";
  }
  run() {
    if (this.hasRun || !LustArenaStyleTweak.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.injectCSS();
    HHPlusPlusReplacer.doWhenSelectorAvailable('.main-container [rel="pvp-arena"]', ($el) => {
      const $MapContainer = $('.left-side-container [rel="map"] > .notif-position > span');
      const leftSideBgColor = $MapContainer.css("background-color");
      const leftSideColor = $MapContainer.children().css("color");
      GM_addStyle(
        `:root {--lust-arena-left-side-bg-color: ${leftSideBgColor};--lust-arena-left-side-color: ${leftSideColor};}`,
      );
      //wrap in a div to be able to target with css
      $el.wrap('<div class="lust-arena-style-tweak-wrapper"></div>');
      const $wrapper = $el.parent();
      const leagueInfo = PlayerStorageHandler.getPlayerLeagueRank();
      const $leaguesA = $(
        html`<a href="${shared.general.getDocumentHref("/leagues.html")}" rel="leagues">
          <img
            src="${IMAGES_URL}/pictures/design/leagues/${leagueInfo.league}.png"
            alt="Leagues Icon"
          />
          <p>#${leagueInfo.rank}</p>
        </a>`,
      );
      $wrapper.append($leaguesA);
      const $seasonA = $(
        html`<a href="${shared.general.getDocumentHref("/season.html")}" tooltip rel="season">
          <img src="${IMAGES_URL}/pictures/design/season_pass_alt.png" alt="Seasons Icon" />
          <p>${GT.design.Season}</p>
        </a>`,
      );
      $seasonA.attr("hh_title", this.generateSeasonTooltip());
      $wrapper.append($seasonA);

      const width = $seasonA.css("width");
      const length = GT.design.Season.length;
      $seasonA.find("p").css("font-size", `clamp(9px, calc(${width} / ${length} * 1.75), 14px)`);
    });
  }
  private async injectCSS() {
    GM_addStyle(LustArenaStyleTweakCss);
  }
  private generateSeasonTooltip(): string {
    const seasonInfo = PlayerStorageHandler.getPlayerSeasonInfo();
    if (seasonInfo === null) {
      return "No stored season info";
    }

    const name = seasonInfo.name ?? "";
    const currentMojo = seasonInfo.mojo;
    const prevTier = seasonInfo.previousTierThreshold;
    const nextTier = seasonInfo.nextTierThreshold;
    const tier = seasonInfo.tier;

    // Calculate progress percentage
    let progressPercent: number;
    if (nextTier === undefined) {
      // Max tier reached
      progressPercent = 100;
    } else {
      const tierRange = nextTier - prevTier;
      const mojoInTier = currentMojo - prevTier;
      console.log("tierRange:", tierRange, "mojoInTier:", mojoInTier);
      progressPercent = Math.min(100, Math.max(0, (mojoInTier / tierRange) * 100));
    }

    // Build the mojo display line
    const mojoDisplay =
      nextTier !== undefined ? `${currentMojo} / ${nextTier}` : `${currentMojo} (Max)`;

    // Build tooltip HTML - must be a single line for tooltip attribute
    console.log("progressPercent:", progressPercent);
    return html`<div class="season-tooltip">
      <div class="season-tooltip-name">${name}</div>
      <div class="season-tooltip-tier-row">
        <span class="season-tooltip-tier">${GT.design.tier} ${tier}</span>
        <span class="season-tooltip-mojo"
          >${mojoDisplay}<img
            src="${IMAGES_URL}/mojo_logo.svg"
            alt="mojo"
            class="season-tooltip-mojo-icon"
        /></span>
      </div>
      <div class="season-tooltip-bar-container">
        <div class="season-tooltip-bar-fill" style="width: ${progressPercent}%;"></div>
      </div>
    </div>`;
  }
}
