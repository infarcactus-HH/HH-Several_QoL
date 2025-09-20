import type { HHModule } from "./types/HH++";
import PopupPlusPlus from "./modules/Popup++";
import GirlsToWiki from "./modules/GirlsToWiki";
import NoOnlyRealMoneyOptions from "./modules/NoOnlyRealMoneyOptions";
import TighterPoP from "./modules/TighterPoP";
import LabyTeamPresets from "./modules/LabyTeamPresets";
import NoAnnoyingPopups from "./modules/NoAnnoyongPopups";

class Userscript {
  private hhPlusPlusConfig: any;

  constructor() {
    if (unsafeWindow["hhPlusPlusConfig"] === undefined) {
      $(document).one("hh++-bdsm:loaded", () => {
        this.initializeHHPlusPlus();
        this.run();
      });
      return;
    }
    this.initializeHHPlusPlus();
    this.run();
  }

  private initializeHHPlusPlus() {
    const { hhPlusPlusConfig } = unsafeWindow;
    this.hhPlusPlusConfig = hhPlusPlusConfig;
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
    this.hhPlusPlusConfig.registerGroup({
        key: "severalQoL",
        name: "Several QoL"
    })
    allModules.forEach(module => {
        this.hhPlusPlusConfig.registerModule(module)
    })
    this.hhPlusPlusConfig.loadConfig()
    this.hhPlusPlusConfig.runModules()
  }
}

new Userscript();
