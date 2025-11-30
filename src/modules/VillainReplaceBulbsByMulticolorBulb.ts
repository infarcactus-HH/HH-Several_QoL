import { VillainPreBattle } from "../types/GameTypes/villains";
import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import html from "../utils/html";
import VillainReplaceBulbsByMulticolorBulbCss from "../css/modules/VillainReplaceBulbsByMulticolorBulb.css";

export default class VillainReplaceBulbsByMulticolorBulb extends HHModule {
  readonly configSchema = {
    baseKey: "villainReplaceBulbsByMulticolorBulb",
    label: "Villain: Replace bulbs by multicolor bulb",
    default: true,
  };
  static shouldRun() {
    return location.pathname === "/troll-pre-battle.html";
  }
  run() {
    if (this.hasRun || !VillainReplaceBulbsByMulticolorBulb.shouldRun()) {
      return;
    }
    this.hasRun = true;
    console.log("VillainReplaceBulbsByMulticolorBulb module running");
    const opponentFighter = unsafeWindow.opponent_fighter as VillainPreBattle | undefined;
    if (!opponentFighter) {
      return;
    }
    if (opponentFighter.rewards.data.rewards.find((reward) => reward.type === "scrolls_common")) {
      HHPlusPlusReplacer.doWhenSelectorAvailable(
        ".slot.size_small[class*='slot_scrolls_']",
        ($el) => {
          const multicolorBulbHtml = html`<div
            class="slot slot_scrolls_mythic size_small"
            tooltip="1 of each bulb available as drop"
          >
            <span class="scrolls_multicolor_icn"></span>
            <div class="amount">1</div>
          </div>`;
          $el.first().replaceWith(multicolorBulbHtml);
          $el.slice(1).remove();
        },
      );
    }
    this.injectCSS();
  }
  private async injectCSS() {
    GM_addStyle(VillainReplaceBulbsByMulticolorBulbCss);
  }
}
