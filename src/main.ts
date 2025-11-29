import type { HHModule, HHModule_ConfigSchema } from "./types/HH++";
import PopupPlusPlus from "./modules/Popup++";
import People from "./modules/PeopleToWiki";
import LabyTeamPresets from "./modules/LabyTeamPresets";
import WhaleBossTournament from "./modules/WhaleBossTournament";
import PlacesOfPowerPlusPlus from "./modules/PlacesOfPower++";
import NoReloadFromClaimingDailyChests from "./modules/NoReloadFromClaimingDailyChests";
import MERankingInfo from "./modules/MERankingInfo";
import EventInfo from "./modules/EventInfo";
import UpdateHandler from "./UpdateHandler";
import LoveRaids from "./modules/LoveRaids";
import PoVPoGHideClaimAllUntilLastDay from "./modules/PoVPoGHideClaimAllUntilLastDay";
import FixSessID from "./modules/FixSessID";
import { sessionStorageHandler } from "./utils/StorageHandler";
import ShardTracker from "./modules/VillainShardTracker";
import PopupMinusMinus from "./modules/Popup--";
import CustomCSS from "./AlwaysRunningModules/customCSS";
import LustArenaStyleTweak from "./modules/LustArenaStyleTweak";
import PlayerLeagueTracking from "./AlwaysRunningModules/PlayerLeagueTracking";
import PlayerSeasonTracking from "./AlwaysRunningModules/PlayerSeasonTracking";
import NutakuLogout from "./AlwaysRunningModules/NutakuLogout";
import LeaguesQoL from "./modules/LeaguesQoL";

class Userscript {
  constructor() {
    if (location.pathname === "/integrations/") {
      return;
    } // do not run on integrations page otherwise it breaks on phone
    if (location.hostname.startsWith("nutaku")) {
      this.applySessionFix();
      this.allModules.push(FixSessID);
    }
    if (unsafeWindow["hhPlusPlusConfig"] === undefined) {
      Promise.race([
        new Promise((resolve) => {
          $(document).one("hh++-bdsm:loaded", () => resolve("hh++-bdsm:loaded"));
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
    PopupMinusMinus,
    PopupPlusPlus,
    PlacesOfPowerPlusPlus,
    NoReloadFromClaimingDailyChests,
    People,
    LabyTeamPresets,
    MERankingInfo,
    WhaleBossTournament,
    LeaguesQoL,
    EventInfo,
    LoveRaids,
    PoVPoGHideClaimAllUntilLastDay,
    ShardTracker,
    LustArenaStyleTweak,
  ];
  alwaysRunningModules = [PlayerLeagueTracking, CustomCSS, PlayerSeasonTracking, NutakuLogout];
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
              const subSettings = schema.subSettings.reduce(
                (acc, setting) => {
                  acc[setting.key] = setting.default;
                  return acc;
                },
                {} as Record<string, any>,
              );
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
    if (!location.search.includes("sess=") && sessionStorageHandler.getSessID() != "") {
      const storedSessID = sessionStorageHandler.getSessID();
      if (!storedSessID) {
        return;
      }
      const newURL =
        location.href + (location.href.includes("?") ? "&" : "?") + "sess=" + storedSessID;
      console.log("FixSessID: reloading page with stored sessID:", newURL);
      window.location.replace(newURL);
    }
  }
  run() {
    UpdateHandler.run();
    this.alwaysRunningModules.forEach((module) => {
      if (module.shouldRun()) {
        new module().run();
      }
    });
  }
}

new Userscript();
