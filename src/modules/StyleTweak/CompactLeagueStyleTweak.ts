import { SubModule } from "../../base";
import { CompactLeagueStyleTweakCss } from "../../css/modules";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";

export default class CompactLeagueStyleTweak implements SubModule {
  run() {
    this.injectCSS();
    HHPlusPlusReplacer.doWhenSelectorAvailable(".league_table > .data-list", ($el) => {
      new MutationObserver(() => {
        $el.parent()[0].scrollTo({ top: 0, behavior: "instant" });
      }).observe($el[0], { childList: true });
    });
  }
  async injectCSS() {
    GM_addStyle(CompactLeagueStyleTweakCss);
  }
}
