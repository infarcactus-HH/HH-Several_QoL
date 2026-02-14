import { AlwaysRunningModule } from "../base";
import { MythicGirlGearPachinkoSummaryCss } from "../css/AlwaysRunningModules";
import { EquipmentPachinko_AjaxResponse, GirlArmorItemMythic } from "../types";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

export default class MythicGirlGearPachinkoSummary extends AlwaysRunningModule {
  static shouldRun() {
    return location.pathname === "/pachinko.html";
  }
  run() {
    if (this.hasRun || !MythicGirlGearPachinkoSummary.shouldRun()) {
      return;
    }
    this.hasRun = true;
    console.log("GirlGearTracking module running");
    this.hookAjaxComplete();
    this.injectCss();
  }
  obtainedMythicEquips: Array<GirlArmorItemMythic> = [];
  hookAjaxComplete() {
    $(document).ajaxComplete((_event, xhr, settings) => {
      if (!(typeof settings?.data === "string")) {
        return;
      }
      if (settings.data.includes("action=play&what=pachinko6")) {
        const response = xhr.responseJSON as EquipmentPachinko_AjaxResponse;
        if (!response || !response.success) {
          return;
        }
        for (const equipment of response.rewards.data.rewards) {
          if (equipment.value.rarity === "mythic") {
            console.log("Mythic armor obtained!", equipment);
            this.obtainedMythicEquips.push(equipment.value);
            if (this.obtainedMythicEquips.length === 1) {
              this.addMythicSummary();
            }
            console.log(this.obtainedMythicEquips);
          }
        }
      }
    });
  }
  addMythicSummary() {
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      `.playing-zone[type-panel="equipment"]`,
      ($panel) => {
        if (this.obtainedMythicEquips.length === 0) {
          return;
        }
        const $summary = $(
          `<img id="qol-mythic-armor-drops" src="https://hh.hh-content.com/design/ic_books_gray.svg" tooltip="Show Mythic armors obtained this sessions">`,
        );
        $panel.append($summary);
        $summary.on("click", () => {
          shared.reward_popup.Reward.handlePopup({
            data: { loot: true, rewards: this.obtainedMythicEquips },
            title: "Mythic armors obtained :",
          });
        });
      },
    );
  }
  async injectCss() {
    GM_addStyle(MythicGirlGearPachinkoSummaryCss);
  }
}
