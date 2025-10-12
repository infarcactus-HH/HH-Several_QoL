import { HHModule } from "../types/HH++";

export default class NoAnnoyingPopups extends HHModule {
  configSchema = {
      baseKey: "noAnnoyingPopups",
      label: "<span tooltip='Tired of shop popups or news popup appearing randomly and breaking your flow ?'>Removes annoying popup appearing automaticly for shops, paths, news</span>",
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
    document.cookie = "disabledPopups=PassReminder,Bundles,News; path=/";
  }
}
