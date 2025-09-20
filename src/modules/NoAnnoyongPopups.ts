import { HHModule } from "../types/HH++";

export default class NoAnnoyingPopups extends HHModule {
  constructor() {
    const configSchema = {
      baseKey: "noAnnoyingPopups",
      label: "Removes popup appearing automaticly to pay for paths etc",
      default: false,
    };
    super(configSchema);
  }
  shouldRun() {
    return true;
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    document.cookie = "disabledPopups=PassReminder; path=/";
  }
}
