import { SubModule } from "../../base";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";

export default class LeagueNoPlayerProfileOnNameClick implements SubModule {
  run() {
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      '.data-row.body-row .data-column[column="nickname"]',
      () => {
        $("body").off("click", '.data-row.body-row .data-column[column="nickname"]');
      },
    );
  }
}
