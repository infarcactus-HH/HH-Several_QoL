import { HHModule, SubModule } from "../../base";
import { povPoGHideClaimAllUntilLastDayCss } from "../../css/modules";

export default class PoVPoGHideClaimAllUntilLastDay implements SubModule {
  run() {
    const timeRemaining: number | undefined = unsafeWindow.time_remaining;
    if (timeRemaining === undefined) {
      return;
    }
    // 23.5 hours contests Unlock
    if (timeRemaining > 23.5 * 60 * 60) {
      this.injectCSS();
      console.log("PoVPoGHideClaimAllUntilLastDay module running");
    }
  }
  private async injectCSS() {
    GM_addStyle(povPoGHideClaimAllUntilLastDayCss);
  }
}
