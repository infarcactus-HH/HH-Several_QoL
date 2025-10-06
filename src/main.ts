import type { HHModule, HHModule_ConfigSchema } from "./types/HH++";
import PopupPlusPlus from "./modules/Popup++";
import GirlsToWiki from "./modules/GirlsToWiki";
import NoOnlyRealMoneyOptions from "./modules/NoOnlyRealMoneyOptions";
import TighterPoP from "./modules/TighterPoP";
import LabyTeamPresets from "./modules/LabyTeamPresets";
import NoAnnoyingPopups from "./modules/NoAnnoyingPopups";
import WhaleBossTournament from "./modules/WhaleBossTournament";
import PlacesOfPowerPlusPlus from "./modules/PlacesOfPower++";
import NoReloadFromClaimingDailyChests from "./modules/NoReloadFromClaimingDailyChests";
import PoVInfo from "./modules/PoVInfo";

class Userscript {
  constructor() {
    if (unsafeWindow["hhPlusPlusConfig"] === undefined) {
      Promise.race([
        new Promise((resolve) => {
          $(document).one("hh++-bdsm:loaded", () =>
            resolve("hh++-bdsm:loaded")
          );
        }),
        new Promise((resolve) => setTimeout(() => resolve("timeout"), 50)),
      ]).then((result) => {
        if (result === "hh++-bdsm:loaded") {
          this.run();
        } else {
          this.runWithoutBdsm();
        }
      });
      return;
    }
    this.run();
  }

  allModules: HHModule<any>[] = [
    new PopupPlusPlus(),
    new LabyTeamPresets(),
    new NoAnnoyingPopups(),
    new NoOnlyRealMoneyOptions(),
    new GirlsToWiki(),
    new TighterPoP(),
    new WhaleBossTournament(),
    new PlacesOfPowerPlusPlus(),
    new NoReloadFromClaimingDailyChests(),
    new PoVInfo(),
  ];
  run() {
    unsafeWindow.hhPlusPlusConfig.registerGroup({
      key: "severalQoL",
      name: "<span tooltip='by infarctus'>Several QoL</span>",
    });
    this.allModules.forEach((module) => {
      unsafeWindow.hhPlusPlusConfig.registerModule(module);
    });
    unsafeWindow.hhPlusPlusConfig.loadConfig();
    unsafeWindow.hhPlusPlusConfig.runModules();
  }
  runWithoutBdsm() {
    this.allModules.forEach((module) => {
      try {
        const schema = module.configSchema as HHModule_ConfigSchema;
        if (module.shouldRun()) {
          if (schema.subSettings) {
            const subSettings = schema.subSettings.reduce((acc, setting) => {
              acc[setting.key] = true;
              return acc;
            }, {} as Record<string, any>);
            module.run(subSettings);
          } else {
            module.run(undefined);
          }
        }
      } catch (e) {
        console.error("Error running module", module, e);
      }
    });
  }
}

new Userscript();
