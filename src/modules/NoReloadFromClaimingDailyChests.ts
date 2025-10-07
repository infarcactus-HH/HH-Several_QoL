import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

const configSchema = {
  baseKey: "noReloadFromClaimingDailyChests",
  label: "No reload from claiming daily chests",
  default: true,
} as const;

declare let daily_goals_member_progression: {
  tier: number;
  potions_amount: number;
  taken_rewards_array: Array<string>;
  date_for: string; //"2025-10-06",
  next_rewards_in: number;
};

export default class NoReloadFromClaimingDailyChests extends HHModule {
  constructor() {
    super(configSchema);
  }
  shouldRun() {
    return true;
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return location.pathname.includes("/activities.html");
    }
    this.hasRun = true;
    const $DailyGoals = $(".switch-tab[data-tab='daily_goals']");
    $DailyGoals.on("click", () => {
      console.log("Clicked daily goals");
      HHPlusPlusReplacer.doWhenSelectorAvailable(
        ".progress-bar-claim-reward",
        () => {
          this.applyNoReloadFix();
        }
      );
    });
  }
  applyNoReloadFix() {
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
        shared.general.hh_ajax(t, (t: any) => {
          const n = t.rewards;
          shared.reward_popup.Reward.handlePopup(n);
          self.checkIfAllChestsClaimed();
        });
      });
    $(".progress-bar-claim-reward").attr(
      "tooltip",
      "Several QoL: Claim without reload"
    );
  }

  checkIfAllChestsClaimed() {
    if (
      daily_goals_member_progression.taken_rewards_array.length >= daily_goals_member_progression.tier
    ) {
      $(`[data-tab="daily_goals"] > .collect_notif`).remove();
    }
  }
}
