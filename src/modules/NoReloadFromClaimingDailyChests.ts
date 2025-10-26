import {
  HHModule,
  HHModule_ConfigSchema,
  SubSettingsType,
} from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

declare let daily_goals_member_progression: {
  tier: number;
  potions_amount: number;
  taken_rewards_array: Array<string>;
  date_for: string; //"2025-10-06",
  next_rewards_in: number;
};

type configSchema = {
  baseKey: "noReloadFromClaimingDailyChests";
  label: "Activities : No reload from claiming daily chests";
  default: true;
  subSettings: [
    {
      key: "popupEnabled";
      default: true;
      label: "Show reward popup on claiming";
    }
  ];
};

export default class NoReloadFromClaimingDailyChests extends HHModule {
  readonly configSchema: HHModule_ConfigSchema = {
    baseKey: "noReloadFromClaimingDailyChests",
    label: "Activities : No reload from claiming daily chests",
    default: true,
    subSettings: [
      {
        key: "popupEnabled",
        default: true,
        label: "Show reward popup on claiming",
      },
    ],
  };
  static shouldRun() {
    return true;
  }
  run(subSettings: SubSettingsType<configSchema>) {
    if (this.hasRun || !NoReloadFromClaimingDailyChests.shouldRun()) {
      return location.pathname.includes("/activities.html");
    }
    this.hasRun = true;
    const $DailyGoals = $(".switch-tab[data-tab='daily_goals']");
    $DailyGoals.on("click", () => {
      console.log("Clicked daily goals");
      HHPlusPlusReplacer.doWhenSelectorAvailable(
        ".progress-bar-claim-reward",
        () => {
          this.applyNoReloadFix(subSettings.popupEnabled);
        }
      );
    });
  }
  applyNoReloadFix(popupEnabled: boolean) {
    const self = this;
    $(".progress-bar-claim-reward")
      .off("click")
      .on("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        // OG function modified
        $(this).prop("disabled", true);
        const tier = $(this).attr("tier");
        if (!tier) {
          return;
        }
        const t = {
          action: "claim_daily_goal_tier_reward",
          tier: tier,
        };
        daily_goals_member_progression.taken_rewards_array.push(tier);
        shared.animations.loadingAnimation.start();
        shared.general.hh_ajax(t, (t: any) => {
          if (popupEnabled) {
            const n = t.rewards;
            shared.reward_popup.Reward.handlePopup(n);
          } else {
            shared.Hero.updates(t.rewards.heroChangesUpdate, false);
          }
          self.checkIfAllChestsClaimed();
          shared.animations.loadingAnimation.stop();
        });
      });
    $(".progress-bar-claim-reward").attr(
      "tooltip",
      `Several QoL: Claim without reload${
        popupEnabled ? "" : " & without popup"
      }`
    );
  }

  checkIfAllChestsClaimed() {
    if (
      daily_goals_member_progression.taken_rewards_array.length >=
      Math.min(
        Math.floor(daily_goals_member_progression.potions_amount / 20),
        5
      )
    ) {
      $(`[data-tab="daily_goals"] > .collect_notif`).remove();
    }
  }
}
