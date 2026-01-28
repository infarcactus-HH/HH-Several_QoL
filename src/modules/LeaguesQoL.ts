import { HHModule, HHModule_ConfigSchema, SubSettingsType } from "../base";
import LeagueNoPlayerProfileOnNameClick from "./LeaguesQoL/LeagueNoPlayerProfileOnNameClick";
import LeagueOpponentHistory from "./LeaguesQoL/LeagueOpponentHistory";
import NoRefillEnergyConfirm from "./LeaguesQoL/NoRefillEnergyConfirm_LeagueQoL";

type LeaguesQoL_configSchema = {
  baseKey: "leaguesQoL";
  label: "Leagues QoL :";
  default: false;
  subSettings: [
    {
      key: "leagueOpponentHistory";
      label: "<span tooltip='click on the row to refresh, only looks for highest league'>Show history of opponents</span>";
      default: false;
    },
    {
      key: "leagueNoPlayerProfileOnNameClick";
      label: "Disable opening player profile when clicking on their name";
      default: false;
    },
    {
      key: "noRefillEnergyConfirm";
      label: "Disable koban spending confirmation when refilling energy in leagues";
      default: false;
    },
  ];
};

export default class LeaguesQoL extends HHModule {
  readonly configSchema: HHModule_ConfigSchema = {
    baseKey: "leaguesQoL",
    label: "Leagues QoL :",
    default: false,
    subSettings: [
      {
        key: "leagueOpponentHistory",
        label:
          "<span tooltip='click on the row to refresh, only looks for highest league'>Show history of opponents</span>",
        default: false,
      },
      {
        key: "leagueNoPlayerProfileOnNameClick",
        label: "Disable opening player profile when clicking on their name",
        default: false,
      },
      {
        key: "noRefillEnergyConfirm",
        label: "Disable koban spending confirmation when refilling energy in leagues",
        default: false,
      },
    ],
  };
  static shouldRun() {
    return location.pathname.includes("/leagues.html");
  }
  run(subSettings: SubSettingsType<LeaguesQoL_configSchema>) {
    if (this.hasRun || !LeaguesQoL.shouldRun()) {
      return;
    }
    this.hasRun = true;
    console.log("LeaguesQoL module running");
    if (subSettings.leagueOpponentHistory) {
      new LeagueOpponentHistory().run();
    }
    if (subSettings.leagueNoPlayerProfileOnNameClick) {
      new LeagueNoPlayerProfileOnNameClick().run();
    }
    if (subSettings.noRefillEnergyConfirm) {
      new NoRefillEnergyConfirm().run();
    }
  }
}
