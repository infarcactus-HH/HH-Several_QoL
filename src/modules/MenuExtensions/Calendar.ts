import { SubModule } from "../../types/subModules";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";
import html from "../../utils/html";
import GameHelpers from "../../utils/GameHelpers";
import calendarCss from "../../css/modules/MenuExtensions/Calendar.css";

export default class Calendar implements SubModule {
  run() {
    this.injectCSS();
    this.addCalendarOption();
  }

  private async injectCSS() {
    GM_addStyle(calendarCss);
  }

  addCalendarOption() {
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      "#contains_all > nav > [rel='content'] > div",
      ($navDiv) => {
        const calendarURL = `https://raw.githubusercontent.com/infarcactus-HH/HH-Several_QoL/refs/heads/main/images/calendar/${GameHelpers.getGameKey()}.jpg`;

        const $calendarMenuItem = $(
          html`<a>
            <div><ic class="calendar"></ic><span>Calendar</span></div>
          </a>`,
        );
        $navDiv.prepend($calendarMenuItem);

        const $calendarPopup = $(html`<img src="${calendarURL}" alt="calendar" />`);
        $calendarMenuItem.on("click", function () {
          GameHelpers.createPopup("common", "calendar-qol", $calendarPopup, "Calendar");
        });
      },
    );
  }
}
