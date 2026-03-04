import { SubModule } from "../../base";
import { povPoGHideClaimAllUntilLastDayStyleTweakCss } from "../../css/modules";

export default class PoVPoGHideClaimAllUntilLastDayStyleTweak implements SubModule {
  run_() {
    const timeRemaining: number | undefined = unsafeWindow.time_remaining;
    if (timeRemaining === undefined) {
      return;
    }
    // 23.5 hours contests Unlock
    if (timeRemaining > 23.5 * 60 * 60) {
      this._injectCSS();
      console.log("PoVPoGHideClaimAllUntilLastDay module running");
    }
  }
  private async _injectCSS() {
    GM_addStyle(povPoGHideClaimAllUntilLastDayStyleTweakCss);
  }
}
