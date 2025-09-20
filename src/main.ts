import type { HHModule } from "./types/HH++";
import PopupPlusPlus from "./modules/Popup++";
import GirlsToWiki from "./modules/GirlsToWiki";
import NoOnlyRealMoneyOptions from "./modules/NoOnlyRealMoneyOptions";
import TighterPoP from "./modules/TighterPoP";
import LabyTeamPresets from "./modules/LabyTeamPresets";
import NoAnnoyingPopups from "./modules/NoAnnoyongPopups";

class Userscript {

  constructor() {
    if (unsafeWindow["hhPlusPlusConfig"] === undefined) {
      $(document).one("hh++-bdsm:loaded", () => {
        this.run();
      });
      return;
    }
    this.run();
  }

  run() {
    const allModules : HHModule<any>[] = [
        new PopupPlusPlus(),
        new LabyTeamPresets(),
        new NoAnnoyingPopups(),
        new NoOnlyRealMoneyOptions(),
        new GirlsToWiki(),
        new TighterPoP(),
    ]
    unsafeWindow.hhPlusPlusConfig.registerGroup({
        key: "severalQoL",
        name: "Several QoL"
    })
    allModules.forEach(module => {
        unsafeWindow.hhPlusPlusConfig.registerModule(module)
    })
    unsafeWindow.hhPlusPlusConfig.loadConfig()
    unsafeWindow.hhPlusPlusConfig.runModules()
  }
}

new Userscript();
