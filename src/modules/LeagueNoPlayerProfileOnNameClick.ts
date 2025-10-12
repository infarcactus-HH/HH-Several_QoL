import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

const configSchema = {
  baseKey: "leagueNoPlayerProfileOnNameClick",
  label: "Disable opening player profile when clicking on their name in league",
  default: false,
} as const;

export default class LeagueNoPlayerProfileOnNameClick extends HHModule {
  constructor() {
    super(configSchema);
  }
  shouldRun() {
    return location.pathname.includes("/leagues.html");
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      '.data-row.body-row .data-column[column="nickname"]',
      () => {
        $("body").off(
          "click",
          '.data-row.body-row .data-column[column="nickname"]'
        );
      }
    );
    $(document).on("league:table-sorted", () => {
      $("body").off(
        "click",
        '.data-row.body-row .data-column[column="nickname"]'
      );
    });
  }
}
