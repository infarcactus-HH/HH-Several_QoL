import { HHModule } from "../types/HH++";

export default class NoOnlyRealMoneyOptions extends HHModule {
  readonly configSchema = {
    baseKey: "entirePaid",
    label:
      "Removes only $ options (will be deprecated when fully released publicly)",
    default: false,
  } as const;
  shouldRun() {
    return true;
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    GM.addStyle(`.pass_reward.reward_wrapper{display:none!important;}`);
    GM.addStyle(`#gsp_btn_holder{display:none!important;}`);
    GM.addStyle(
      `.rewards_seasons_row .rewards_pair .tier_number{top:100%!important;}`
    );
    GM.addStyle(`#get_mega_pass_shop_btn{display:none!important;}`);
    GM.addStyle(`#bundles_tab{display:none!important;}`); // ME
    GM.addStyle(`.purchase-shop{display:none!important;}`);
  }
}
