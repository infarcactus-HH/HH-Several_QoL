import type { VillainPreBattle } from "../../types";
import html from "../../utils/html";
import VillainReplaceBulbsByMulticolorBulbCss from "../../css/modules/VillainReplaceBulbsByMulticolorBulb.css";
import { SubModule } from "../../base";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";

export default class VillainReplaceBulbsByMulticolorBulb implements SubModule {
  run() {
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
            tooltip="1 bulb of a random rarity"
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
