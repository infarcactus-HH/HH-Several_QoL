import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

export default class WhaleBossTournament extends HHModule {
  readonly configSchema = {
    baseKey: "whaleBossTournament",
    label: "Renames WBT to Whale Boss Tournament",
    default: false,
  };
  static shouldRun() {
    return location.pathname.includes("/home.html");
  }
  run() {
    if (this.hasRun || !WhaleBossTournament.shouldRun()) {
      return;
    }
    this.hasRun = true;
    HHPlusPlusReplacer.doWhenSelectorAvailable(".world-boss .title", ($element) => {
      $element.each((_, el) => {
        const $el = $(el);
        if ($el.parent().attr("rel") === "world-boss-co-op") {
          $el.text("Whale Boss Co-Op");
        } else {
          $el.text("Whale Boss Tournament");
        }
      });
    });
  }
}
