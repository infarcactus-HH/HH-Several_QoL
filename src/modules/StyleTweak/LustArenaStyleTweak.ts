import { SubModule } from "../../base";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";
import { LustArenaStyleTweakCss } from "../../css/modules";
import html from "../../utils/html";
import { PlayerStorageHandler } from "../../utils/StorageHandler";

export default class LustArenaStyleTweak implements SubModule {
  run() {
    if (this.isInTutoLustArena()) {
      return;
    }
    this.injectCSS();
    HHPlusPlusReplacer.doWhenSelectorAvailable('.main-container [rel="pvp-arena"]', ($el) => {
      const $MapContainer = $('.left-side-container [rel="map"] > .notif-position > span');
      const leftSideBgColor = $MapContainer.css("background-color");
      const leftSideColor = $MapContainer.children().css("color");
      GM_addStyle(
        `:root {--lust-arena-left-side-bg-color: ${leftSideBgColor};--lust-arena-left-side-color: ${leftSideColor};}`,
      );
      //wrap in a div to be able to target with css
      const $wrapper = $('<div class="lust-arena-style-tweak-wrapper"></div>');
      $el.replaceWith($wrapper);
      console.log("LustArenaStyleTweak: injecting league and season info", $wrapper);
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

      // Create right section with 2 rows
      const $rightSection = $('<div class="lust-arena-right-section"></div>');

      const $seasonA = $(
        html`<a
          href="${shared.general.getDocumentHref("/season.html")}"
          tooltip
          rel="season"
          class="season-no-image"
        >
          <p>${GT.design.Season}</p>
        </a>`,
      );
      $seasonA.attr("hh_title", this.generateSeasonTooltip());
      // font-size for season will be computed after elements are in DOM
      $rightSection.append($seasonA);

      const $pentaDrillA = $(
        html`<a href="${shared.general.getDocumentHref("/penta-drill.html")}" rel="penta-drill">
          <p>${GT.design.penta_drill}</p>
        </a>`,
      );
      $rightSection.append($pentaDrillA);

      $wrapper.append($rightSection);

      // Now that elements are in the DOM, measure actual widths (numeric) and set font-sizes
      const numericWidthSeason = $seasonA.width() ?? 0; // returns number (px)
      const lengthSeason = GT.design.Season.length;
      $seasonA
        .find("p")
        .css(
          "font-size",
          `clamp(11px, calc(${numericWidthSeason}px / ${lengthSeason} * 1.75), 14px)`,
        );

      const numericWidthPenta = $pentaDrillA.width() ?? 0;
      const lengthPentaDrill = GT.design.penta_drill.length;
      $pentaDrillA.find("p").css({
        "font-size": `clamp(9px, calc(${numericWidthPenta}px / ${lengthPentaDrill} * 1.6), 14px)`,
      });
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
    const colors = this.getColors();
    console.log("progressPercent:", progressPercent);
    return html`<div class="season-tooltip">
      <div class="season-tooltip-name">${name}</div>
      <div class="season-tooltip-tier-row">
        <span class="season-tooltip-tier" style="color: ${colors.tier}">
          ${GT.design.tier} ${tier}
        </span>
        <span class="season-tooltip-mojo"
          >${mojoDisplay}<img
            src="${IMAGES_URL}/mojo_logo.svg"
            alt="mojo"
            class="season-tooltip-mojo-icon"
        /></span>
      </div>
      <div class="season-tooltip-bar-container">
        <div
          class="season-tooltip-bar-fill"
          style="width: ${progressPercent}%; background-image: ${colors.barGradient};"
        />
      </div>
    </div>`;
  }

  private getColors(): { barGradient: string; tier: string } {
    const $barDummy = $(
      html`<div class="progress-section">
        <div class="general-progress-bar">
          <div class="progress-bar-fill" />
        </div>
      </div>`,
    );
    $barDummy.appendTo("#contains_all");
    const barGradient = $barDummy.find(".progress-bar-fill").css("background-image");
    $barDummy.remove();

    const $tabDummy = $(
      html`<div class="tabs-switcher">
        <div class="switch-tab" />
      </div>`,
    );
    $tabDummy.appendTo("#contains_all");
    const tier = $tabDummy.find(".switch-tab").css("color");
    $tabDummy.remove();

    return { barGradient, tier };
  }
  private isInTutoLustArena(): boolean {
    if (tutoFeatures.season && !tutoData.home4_1) {
      return true;
    }
    if (tutoFeatures.leagues && !tutoData.home6_1) {
      return true;
    }
    return false;
  }
}
