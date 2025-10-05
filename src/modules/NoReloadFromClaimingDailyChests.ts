import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

const configSchema = {
  baseKey: "noReloadFromClaimingDailyChests",
  label: "No reload from claiming daily chests",
  default: true,
} as const;

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
    $(".progress-bar-claim-reward")
      .off("click")
      .on("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        // OG function modified
        $(this).prop("disabled", true);
        const t = {
          action: "claim_daily_goal_tier_reward",
          tier: $(this).attr("tier"),
        };
        shared.general.hh_ajax(t, function (t : any) {
          const n = t.rewards;
            shared.reward_popup.Reward.handlePopup(n);
        });
      });
    $(".progress-bar-claim-reward").attr(
      "tooltip",
      "Claim reward without reloading the page"
    );
  }
}
