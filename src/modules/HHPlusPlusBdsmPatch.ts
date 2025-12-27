import { HHModule, HHModule_ConfigSchema, SubSettingsType } from "../base";
import { HHPlusPlusBdsmPatchPentaDrillCss } from "../css/modules";
import type { penta_drill_data } from "../types";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

type HHPlusPlusBdsmPatch_configSchema = {
  baseKey: "hhPlusPlusBdsmPatch";
  label: "<span tooltip='Add some things BDSM will add at some point'>HH++ BDSM Patch (Temporary fix/addons)</span>";
  default: true;
  subSettings: [
    {
      key: "pentaDrillHideRewardsPath";
      label: "Penta Drill Hide Rewards Path";
      default: true;
    },
  ];
};

export default class HHPlusPlusBdsmPatch extends HHModule {
  readonly configSchema: HHModule_ConfigSchema = {
    baseKey: "hhPlusPlusBdsmPatch",
    label:
      "<span tooltip='Add some things BDSM will add at some point'>HH++ BDSM Patch (Temporary fix/addons)</span>",
    default: true,
    subSettings: [
      {
        key: "pentaDrillHideRewardsPath",
        label: "Penta Drill Hide Rewards Path",
        default: true,
      },
    ],
  };
  static shouldRun() {
    return true;
  }
  run(subSettings: SubSettingsType<HHPlusPlusBdsmPatch_configSchema>) {
    if (this.hasRun || !HHPlusPlusBdsmPatch.shouldRun()) {
      return;
    }
    this.hasRun = true;
    console.log("HHPlusPlusBdsmPatch module running");
    if (subSettings.pentaDrillHideRewardsPath && location.pathname === "/penta-drill.html") {
      this.pentaDrillHideRewardsPath();
    }
  }
  private pentaDrillHideRewardsPath(): void {
    const pentaDrillData = unsafeWindow.penta_drill_data as penta_drill_data | undefined;
    if (!pentaDrillData) {
      return;
    }
    injectCSS();
    HHPlusPlusReplacer.doWhenSelectorAvailable("#rewards_row > .rewards_pair", () => {
      hidePathRewards();
    });
    HHPlusPlusReplacer.doWhenSelectorAvailable("#left_girl", ($girl) => {
      let isHidden = true;
      $girl.off("click.hhplusplus_bdsm_patch").on("click.hhplusplus_bdsm_patch", () => {
        if (isHidden) {
          unHidePathRewards();
        } else {
          hidePathRewards();
        }
        isHidden = !isHidden;
      });
    });
    function hidePathRewards() {
      $("#rewards_row > .rewards_pair").each(function (this: HTMLElement, index: number) {
        if (index < pentaDrillData!.progression.tier) {
          if (!$(this).find(".btn_claim").length) {
            $(this).hide();
          }
        }
      });
    }
    function unHidePathRewards() {
      $("#rewards_row > .rewards_pair").each(function (this: HTMLElement) {
        $(this).show();
      });
    }
    async function injectCSS() {
      GM_addStyle(HHPlusPlusBdsmPatchPentaDrillCss);
    }
  }
}
