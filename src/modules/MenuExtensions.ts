import { HHModule, HHModule_ConfigSchema, SubSettingsType } from "../base";
import NutakuLogout from "./MenuExtensions/NutakuLogout";
import Calendar from "./MenuExtensions/Calendar";

type MenuExtensions_configSchema = {
  baseKey: "menuExtensions";
  label: "<span tooltip='Menu in top right corner'>Menu Extensions:</span>";
  default: true;
  subSettings: [
    {
      key: "calendar";
      label: "Calendar";
      default: true;
    },
    {
      key: "logout";
      label: "Logout";
      default: true;
    },
  ];
};

export default class MenuExtensions extends HHModule {
  readonly configSchema: HHModule_ConfigSchema = (() => {
    const configSchema = {
      baseKey: "menuExtensions",
      label: "<span tooltip='Menu in top right corner'>Menu Extensions:</span>",
      default: true,
      subSettings: [
        {
          key: "calendar",
          label: "Calendar",
          default: true,
        },
      ],
    };
    if (location.hostname.startsWith("nutaku")) {
      configSchema.subSettings.push({
        key: "logout",
        label: "Logout",
        default: true,
      });
    }
    return configSchema;
  })();
  static shouldRun() {
    return true;
  }
  run(subSettings: SubSettingsType<MenuExtensions_configSchema>) {
    if (this.hasRun || !MenuExtensions.shouldRun()) {
      return;
    }
    this.hasRun = true;
    console.log("MenuExtensions module running");
    if (subSettings.calendar) {
      new Calendar().run();
    }
    if (location.hostname.startsWith("nutaku") && subSettings.logout) {
      new NutakuLogout().run();
    }
  }
}
