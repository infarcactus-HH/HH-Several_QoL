import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import LustArenaStyleTweakCss from "../css/modules/LustArenaStyleTweak.css";
import html from "../utils/html";
import { PlayerStorageHandler } from "../utils/StorageHandler";

export default class LustArenaStyleTweak extends HHModule {
  readonly configSchema = {
    baseKey: "lustArenaStylTweak",
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
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      '.main-container [rel="pvp-arena"]',
      ($el) => {
        const $MapContainer = $(
          '.left-side-container [rel="map"] > .notif-position > span'
        );
        const leftSideBgColor = $MapContainer.css("background-color");
        const leftSideColor = $MapContainer.children().css("color");
        GM_addStyle(
          `:root {--lust-arena-left-side-bg-color: ${leftSideBgColor};--lust-arena-left-side-color: ${leftSideColor};}`
        );
        //wrap in a div to be able to target with css
        $el.wrap('<div class="lust-arena-style-tweak-wrapper"></div>');
        const $wrapper = $el.parent();
        const leagueInfo = PlayerStorageHandler.getPlayerLeagueRank();
        const LeaguesA = html`<a
          href="${shared.general.getDocumentHref("/leagues.html")}"
          rel="leagues"
          tooltip="Go to Leagues"
        >
          <img
            src="${IMAGES_URL}/pictures/design/leagues/${leagueInfo.league}.png"
            alt="Leagues Icon"
          />
          <p>#${leagueInfo.rank}</p>
        </a>`;
        $wrapper.append(LeaguesA);
        const SeasonA = html`<a
          href="${shared.general.getDocumentHref("/season.html")}"
          rel="season"
          tooltip="Go to Seasons"
        >
          <img
            src="${IMAGES_URL}/pictures/design/season_pass_alt.png"
            alt="Seasons Icon"
          />
          <p>Season</p>
        </a>`;
        $wrapper.append(SeasonA);
      }
    );
  }
  async injectCSS() {
    GM_addStyle(LustArenaStyleTweakCss);
  }
}
