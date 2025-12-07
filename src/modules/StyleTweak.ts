import { HHModule, HHModule_ConfigSchema, SubSettingsType } from "../base";
import LustArenaStyleTweak from "./StyleTweak/LustArenaStyleTweak";
import PoVPoGHideClaimAllUntilLastDay from "./StyleTweak/PoVPoGHideClaimAllUntilLastDay";
import VillainReplaceBulbsByMulticolorBulb from "./StyleTweak/VillainReplaceBulbsByMulticolorBulb";

type StyleTweak_configSchema = {
  baseKey: "styleTweak";
  label: "Style Tweak: Visual improvements";
  default: true;
  subSettings: [
    {
      key: "villainReplaceBulbsByMulticolorBulb";
      label: "Villain: Replace bulbs by multicolor bulb";
      default: true;
    },
    {
      key: "lustArenaStyleTweak";
      label: "Lust Arena";
      default: true;
    },
    {
      key: "poVPoGHideClaimAllUntilLastDay";
      label: "PoV/PoG: Hide 'Claim All' until last day";
      default: true;
    },
  ];
};

export default class StyleTweak extends HHModule {
  readonly configSchema: HHModule_ConfigSchema = {
    baseKey: "styleTweak",
    label: "Style Tweak: Visual improvements",
    default: true,
    subSettings: [
      {
        key: "villainReplaceBulbsByMulticolorBulb",
        label: "Villain: Replace bulbs by multicolor bulb",
        default: true,
      },
      {
        key: "lustArenaStyleTweak",
        label: "Lust Arena",
        default: true,
      },
      {
        key: "poVPoGHideClaimAllUntilLastDay",
        label: "PoV/PoG: Hide 'Claim All' until last day",
        default: false,
      },
    ],
  };
  static shouldRun() {
    return true;
  }
  run(subSettings: SubSettingsType<StyleTweak_configSchema>) {
    if (this.hasRun || !StyleTweak.shouldRun()) {
      return;
    }
    this.hasRun = true;
    console.log("StyleTweak module running");
    if (
      subSettings.villainReplaceBulbsByMulticolorBulb &&
      location.pathname === "/troll-pre-battle.html"
    ) {
      new VillainReplaceBulbsByMulticolorBulb().run();
    }
    if (subSettings.lustArenaStyleTweak && location.pathname === "/home.html") {
      new LustArenaStyleTweak().run();
    }
    if (
      subSettings.poVPoGHideClaimAllUntilLastDay &&
      (location.pathname === "/path-of-valor.html" || location.pathname === "/path-of-glory.html")
    ) {
      new PoVPoGHideClaimAllUntilLastDay().run();
    }
  }
}
