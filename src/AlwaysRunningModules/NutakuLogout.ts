import { AlwaysRunningModule } from "../types/AlwaysRunningModules";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import html from "../utils/html";

export default class NutakuLogout extends AlwaysRunningModule {
  static shouldRun() {
    return location.hostname.startsWith("nutaku");
  }
  run() {
    if (this.hasRun || !NutakuLogout.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.addLogoutOption();
  }
  addLogoutOption() {
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      "#contains_all > nav > [rel='content'] > div",
      ($navDiv) => {
        const logoutLink = html`<a
          href="${shared.general.getDocumentHref("/logout.html")}"
          tooltip="Can solve unique issues, like buggy contests or stuff like that"
          logout
        >
          <div>
            <ic class="logout"></ic>
            <span>Logout</span>
          </div>
        </a>`;
        $navDiv.append(logoutLink);
      },
    );
  }
}
