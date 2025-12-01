import { SubModule } from "../../types/subModules";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";

export default class LeagueNoPlayerProfileOnNameClick implements SubModule {
  run() {
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      '.data-row.body-row .data-column[column="nickname"]',
      () => {
        $("body").off("click", '.data-row.body-row .data-column[column="nickname"]');
      },
    );
    $(document).on("league:table-sorted", () => {
      $("body").off("click", '.data-row.body-row .data-column[column="nickname"]');
    });
  }
}
