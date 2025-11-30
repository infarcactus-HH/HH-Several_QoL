import { HHModule, HHModule_ConfigSchema, SubSettingsType } from "../types/HH++";
import NutakuLogout from "./MenuExtensions/NutakuLogout";

type MenuExtensions_configSchema = {
  baseKey: "menuExtensions";
  label: "Menu Extensions:";
  default: true;
  subSettings: [
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
      label: "Menu Extensions:",
      default: true,
      subSettings: [],
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
    if (location.hostname.startsWith("nutaku") && subSettings.logout) {
      new NutakuLogout().run();
    }
  }
}
