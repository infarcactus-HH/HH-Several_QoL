import { HHModule } from "../types/HH++";

export default class NoAnnoyingPopups extends HHModule {
  readonly configSchema = {
    baseKey: "noAnnoyingPopups",
    label:
      "<span tooltip='Tired of shop popups or news popup appearing randomly and breaking your flow ?'>Removes annoying popup appearing automatically for shops, paths, news</span>",
    default: false,
  } as const;
  static shouldRun() {
    return true;
  }
  run() {
    if (this.hasRun || !NoAnnoyingPopups.shouldRun()) {
      return;
    }
    this.hasRun = true;
    //document.cookie = "disabledPopups=PassReminder,Bundles,News; path=/";
    GM_cookie.set({
      name: "disabledPopups",
      value: "PassReminder,Bundles,News",
      domain: location.hostname.split(".").slice(-2).join("."),
      secure: true,
      path: "/",
      sameSite: "no_restriction",
    });
  }
}
