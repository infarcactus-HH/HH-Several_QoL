import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

export default class WhaleBossTournament extends HHModule {
  readonly configSchema = {
    baseKey: "whaleBossTournament",
    label: "Renames WBT to Whale Boss Tournament",
    default: false,
  };
  shouldRun() {
    return location.pathname.includes("/home.html");
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    HHPlusPlusReplacer.doWhenSelectorAvailable(".world-boss .title", () => {
      $(".world-boss .title").text("Whale Boss Tournament");
    });
  }
}
