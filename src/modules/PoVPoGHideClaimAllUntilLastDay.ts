import { HHModule } from "../types/HH++";
import povPoGHideClaimAllUntilLastDayCss from "../css/modules/PoVPoGHideClaimAllUntilLastDay.css";

export default class PoVPoGHideClaimAllUntilLastDay extends HHModule {
  readonly configSchema = {
    baseKey: "povPoGHideClaimAllUntilLastDay",
    label: "PoV/PoG: Hide 'Claim All' until last day",
    default: false,
  };
  static shouldRun() {
    return (
      location.pathname === "/path-of-glory.html" ||
      location.pathname === "/path-of-valor.html"
    );
  }
  run() {
    if (this.hasRun || !PoVPoGHideClaimAllUntilLastDay.shouldRun()) {
      return;
    }
    this.hasRun = true;
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
