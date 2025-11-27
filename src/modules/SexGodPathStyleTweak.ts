import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import SexGodPathStyleTweakCss from "../css/modules/SexGodPathStyleTweak.css";
import html from "../utils/html";

export default class SexGodPathStyleTweak extends HHModule {
  readonly configSchema = {
    baseKey: "lustArenaStyleTweak",
    label: "Lust Arena : Style tweaks",
    default: true,
  };
  static shouldRun() {
    return location.pathname === "/home.html";
  }
  run() {
    if (this.hasRun || !SexGodPathStyleTweak.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.injectCSS();
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      '.main-container [rel="god-path"]',
      ($el) => {
        const $MapContainer = $(
          '.left-side-container [rel="map"] > .notif-position > span'
        );
        const leftSideBgColor = $MapContainer.css("background-color");
        const leftSideColor = $MapContainer.children().css("color");
        GM_addStyle(`:root {--sex-god-path-left-side-bg-color: ${leftSideBgColor};--sex-god-path-left-side-color: ${leftSideColor};}`);
        //wrap in a div to be able to target with css
        $el.wrap('<div class="sex-god-path-style-tweak-wrapper"></div>');
        const $wrapper = $el.parent();
        $el.remove();
        const championA = html`
          <a
            href="${shared.general.getDocumentHref("/champions-map.html")}"
            rel="champions"
            tooltip="Go to Champions"
          >
            <img
              src="${IMAGES_URL}/design/menu/ic_champions.svg"
              alt="Champions Icon"
            />
          </a>
        `;
        $wrapper.append(championA);
        const pantheonA = html`
          <a
            href="${shared.general.getDocumentHref("/pantheon.html")}"
            rel="pantheon"
            tooltip="Go to Pantheon"
          >
            <img
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjQ4cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjQ4cHgiIGZpbGw9IiNGRkZGRkYiPjxnPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iMjQiIHdpZHRoPSIyNCIvPjwvZz48Zz48Zz48cmVjdCBoZWlnaHQ9IjciIHdpZHRoPSIzIiB4PSI0IiB5PSIxMCIvPjxyZWN0IGhlaWdodD0iNyIgd2lkdGg9IjMiIHg9IjEwLjUiIHk9IjEwIi8+PHJlY3QgaGVpZ2h0PSIzIiB3aWR0aD0iMjAiIHg9IjIiIHk9IjE5Ii8+PHJlY3QgaGVpZ2h0PSI3IiB3aWR0aD0iMyIgeD0iMTciIHk9IjEwIi8+PHBvbHlnb24gcG9pbnRzPSIxMiwxIDIsNiAyLDggMjIsOCAyMiw2Ii8+PC9nPjwvZz48L3N2Zz4="
              alt="Pantheon Icon"
            />
          </a>
        `;
        $wrapper.append(pantheonA);
        const labA = html`
          <a
            href="${shared.general.getDocumentHref("/labyrinth-entrance.html")}"
            rel="labyrinth"
            tooltip="Go to Labyrinth"
          >
            <img
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMHB4IiBoZWlnaHQ9IjIwcHgiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIwIDIwIiB2aWV3Qm94PSIwIDAgMjAgMjAiIGZpbGw9IiNGRkZGRkYiPg0KICA8Zz4NCiAgICA8cGF0aCBkPSJNIDE0LjQ5NSA4LjI1IEwgOCA0LjUgTCAxLjUwNSA4LjI1IEwgMS41MDUgMTUuNzUgTCA4IDE5LjUgTCAxNC40OTUgMTUuNzUgWiIgLz4NCiAgICA8cGF0aCBkPSJNIDE2IDguMjUgTCAxNiAxNS43NSBMIDE5Ljc1IDEyIFoiIC8+DQogICAgPHBhdGggZD0iTSA4Ljc1MiAzLjE5NyBMIDE1LjI0OCA2Ljk0NyBMIDEzLjg3NSAxLjgyNCBaIiAvPg0KICA8L2c+DQo8L3N2Zz4NCg=="
              alt="Labyrinth Icon"
            />
          </a>
        `;
        $wrapper.append(labA);
      }
    );
  }
  async injectCSS() {
    GM_addStyle(SexGodPathStyleTweakCss);
  }
}
