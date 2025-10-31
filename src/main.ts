import type { HHModule, HHModule_ConfigSchema } from "./types/HH++";
import PopupPlusPlus from "./modules/Popup++";
import People from "./modules/PeopleToWiki";
import LabyTeamPresets from "./modules/LabyTeamPresets";
import NoAnnoyingPopups from "./modules/NoAnnoyingPopups";
import WhaleBossTournament from "./modules/WhaleBossTournament";
import PlacesOfPowerPlusPlus from "./modules/PlacesOfPower++";
import NoReloadFromClaimingDailyChests from "./modules/NoReloadFromClaimingDailyChests";
import MERankingInfo from "./modules/MERankingInfo";
import LeagueOpponentHistory from "./modules/LeagueOpponentHistory";
import LeagueNoPlayerProfileOnNameClick from "./modules/LeagueNoPlayerProfileOnNameClick";
import EventInfo from "./modules/EventInfo";
import UpdateHandler from "./UpdateHandler";
import LoveRaids from "./modules/LoveRaids";
import PoVPoGHideClaimAllUntilLastDay from "./modules/PoVPoGHideClaimAllUntilLastDay";
import FixSessID from "./modules/FixSessID";
import { sessionStorageHandler } from "./utils/StorageHandler";
import LeagueCorrectRankShowing from "./modules/LeagueCorrectRankShowing";

class Userscript {
  constructor() {
    if (location.hostname.startsWith("nutaku")) {
      this.applySessionFix();
      this.allModules.push(FixSessID);
    }
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
          this.runWithBDSM();
        } else {
          this.runWithoutBdsm();
        }
      });
      return;
    } else {
      this.runWithBDSM();
    }
    this.run();
  }

  allModules = [
    PlacesOfPowerPlusPlus,
    PopupPlusPlus,
    LabyTeamPresets,
    NoAnnoyingPopups,
    People,
    NoReloadFromClaimingDailyChests,
    MERankingInfo,
    WhaleBossTournament,
    LeagueOpponentHistory,
    LeagueNoPlayerProfileOnNameClick,
    EventInfo,
    LoveRaids,
    PoVPoGHideClaimAllUntilLastDay,
    LeagueCorrectRankShowing,
  ];
  runWithBDSM() {
    unsafeWindow.hhPlusPlusConfig.registerGroup({
      key: "severalQoL",
      name: "<span tooltip='By infarctus'>Several QoL</span>",
    });
    if (location.pathname.includes("/home.html")) {
      this.allModules.forEach((module) => {
        unsafeWindow.hhPlusPlusConfig.registerModule(new module());
      });
    } else {
      this.allModules.forEach((module) => {
        if (module.shouldRun()) {
          unsafeWindow.hhPlusPlusConfig.registerModule(new module());
        }
      });
    }
    unsafeWindow.hhPlusPlusConfig.loadConfig();
    unsafeWindow.hhPlusPlusConfig.runModules();
  }
  runWithoutBdsm() {
    this.allModules.forEach((module) => {
      if (module === null) return;
      const moduleInstance = new module();
      try {
        const schema = moduleInstance.configSchema as HHModule_ConfigSchema;
        if (module.shouldRun() && schema.default) {
          try {
            if (schema.subSettings) {
              const subSettings = schema.subSettings.reduce((acc, setting) => {
                acc[setting.key] = setting.default;
                return acc;
              }, {} as Record<string, any>);
              moduleInstance.run(subSettings as any);
            } else {
              moduleInstance.run(undefined as any);
            }
          } catch (e) {
            console.error("Error running module with subsettings", module, e);
          }
        }
      } catch (e) {
        console.error("Error running module", module, e);
      }
    });
  }
  applySessionFix() {
    if (
      !location.search.includes("sess=") &&
      sessionStorageHandler.getSessID() != ""
    ) {
      const storedSessID = sessionStorageHandler.getSessID();
      if (!storedSessID) {
        return;
      }
      const newURL =
        location.href +
        (location.href.includes("?") ? "&" : "?") +
        "sess=" +
        storedSessID;
      console.log("FixSessID: reloading page with stored sessID:", newURL);
      window.location.href = newURL;
    }
  }
  run() {
    UpdateHandler.run();
  }
}

new Userscript();
