import { popupForQueue } from "../types/GameTypes";

export default class GameHelpers {
  static createCommonPopup(
    popupID: string,
    Finit: (popup: popupForQueue["popup"], t: boolean) => void
  ) {
    const generatePopupDOM = $(
      `<div class="popup_wrapper">` +
        `<div class="popup_background clickable"></div>` +
        `<div class="popup several-qol-popup" id="popup-${popupID}">` +
        `<div class="container-special-bg" id="container-${popupID}"></div>` +
        `<close class="closable"></close>` +
        `</div>` +
        `</div>`
    );
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
}
