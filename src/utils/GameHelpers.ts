import { GameKey, popupForQueue } from "../types";
import html from "./html";

export default class GameHelpers {
  static createPopup(
    type: popupForQueue["popup"]["type"],
    popupID: string,
    $content: JQuery<HTMLElement>,
    title?: string,
  ) {
    switch (type) {
      case "common":
        this.createCommonPopup(popupID, (popup, _t) => {
          const $container = popup.$dom_element.find(".container-special-bg");
          if (title) {
            $container.append(html`<div class="title">${title}</div>`);
          }
          $container.append($content);
        });
        break;
      default:
        throw `type ${type} not implemented yet`;
    }
  }

  static createCommonPopup(
    popupID: string,
    Finit: (popup: popupForQueue["popup"], t: boolean) => void,
  ) {
    const generatePopupDOM = $(html`
      <div class="popup_wrapper">
        <div class="popup_background clickable"></div>
        <div class="popup several-qol-popup" id="popup-${popupID}">
          <div class="container-special-bg" id="container-${popupID}"></div>
          <close class="closable"></close>
        </div>
      </div>
    `);
    let generatedPopup: popupForQueue["popup"] = {
      init: function (t: boolean) {
        $(`#common-popups`).prepend(this.$dom_element); // has to append to it ourselves
        Finit(this, t);
      },
      popup_name: "several_qol_common_popup",
      type: "common",
      $dom_element: generatePopupDOM,
      close_on_esc: true,
      addEventListeners: function () {
        this.$dom_element.find("close, .popup_background").on("click", () => {
          this.destroy();
        });
      },
      removeEventListeners() {},
      onOpen() {
        $("#common-popups").append(this.$dom_element);
      },
      onClose() {},
      destroy: function () {
        shared.PopupQueueManager.close({
          type: this.type,
        });
      },
    };
    shared.PopupQueueManager.add({ popup: generatedPopup });
    return generatedPopup;
  }

  static getWikiPageForCurrentGame(name: string): string | undefined {
    const formattedName = name.replace(/ /g, "-");
    if (location.host.includes("heroes.com")) {
      return `https://harem-battle.club/wiki/Harem-Heroes/HH:${formattedName}`;
    } else if (location.host.includes("gayharem")) {
      return `https://harem-battle.club/wiki/Gay-Harem/GH:${formattedName}`;
    } else if (location.host.includes("gaypornstarharem")) {
      return `https://harem-battle.club/wiki/Gay-Pornstar-Harem/GPSH:${formattedName}`;
    }
    return undefined;
  }

  static getGameKey(): GameKey {
    const host = window.location.host;
    if (host.includes(".gayharem.com")) {
      return "GH";
    }
    if (host.includes(".comixharem.com")) {
      return "CxH";
    }
    if (host.includes(".pornstarharem.com")) {
      return "PSH";
    }
    if (host.includes(".gaypornstarharem.com")) {
      return "GPSH";
    }
    if (host.includes(".transpornstarharem.com")) {
      return "TPSH";
    }
    return "HH";
  }
}
