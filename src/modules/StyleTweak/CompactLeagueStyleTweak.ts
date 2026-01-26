import { SubModule } from "../../base";
import { CompactLeagueStyleTweakCss } from "../../css/modules";

export default class CompactLeagueStyleTweak implements SubModule {
  async run() {
    GM_addStyle(CompactLeagueStyleTweakCss);
  }
}
