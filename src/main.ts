import type { HHModule, HHModule_ConfigSchema } from "./types/HH++";
import PopupPlusPlus from "./modules/Popup++";
import People from "./modules/PeopleToWiki";
import LabyTeamPresets from "./modules/LabyTeamPresets";
import NoAnnoyingPopups from "./modules/NoAnnoyingPopups";
import WhaleBossTournament from "./modules/WhaleBossTournament";
import PlacesOfPowerPlusPlus from "./modules/PlacesOfPower++";
import NoReloadFromClaimingDailyChests from "./modules/NoReloadFromClaimingDailyChests";
import PoVInfo from "./modules/PoVInfo";
import MERankingInfo from "./modules/MERankingInfo";
import LeagueOpponentHistory from "./modules/LeagueOpponentHistory";
import LeagueNoPlayerProfileOnNameClick from "./modules/LeagueNoPlayerProfileOnNameClick";
import EventInfo from "./modules/EventInfo";

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

  allModules: HHModule[] = [
    new PopupPlusPlus(),
    new PlacesOfPowerPlusPlus(),
    new LabyTeamPresets(),
    new NoAnnoyingPopups(),
    new People(),
    new NoReloadFromClaimingDailyChests(),
    new MERankingInfo(),
    new LeagueOpponentHistory(),
    new LeagueNoPlayerProfileOnNameClick(),
    new WhaleBossTournament(),
    new PoVInfo(),
    new EventInfo(),
  ];
  run() {
    unsafeWindow.hhPlusPlusConfig.registerGroup({
      key: "severalQoL",
      name: "<span tooltip='By infarctus'>Several QoL</span>",
    });
    if (location.pathname.includes("/home.html")) {
      this.allModules.forEach((module) => {
        unsafeWindow.hhPlusPlusConfig.registerModule(module);
      });
    } else {
      this.allModules.forEach((module) => {
        if (module.shouldRun()) {
          unsafeWindow.hhPlusPlusConfig.registerModule(module);
        }
      });
    }
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
            module.run(subSettings as any);
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
