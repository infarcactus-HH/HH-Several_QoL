import { popupForQueue } from "../types/GameTypes";

export default class GameHelpers {
  static createCommonPopup(popupID: string, Finit: (popup:popupForQueue["popup"],t?: boolean) => void) {
    const generatePopupDOM = $(
      `<div class="popup_wrapper">` +
        `<div class="popup_background clickable"></div>` +
        `<div class="popup">` +
        `<div class="container-special-bg" id="${popupID}"></div>` + // need to add ID
        `<close class="closable"></close>` +
        `</div>` +
        `</div>`
    );
    let generatedPopup: popupForQueue["popup"] = {
      init: function(t:boolean){
        console.log("init common popup",t);
        if(t){return}
        Finit(this,t);
      },
      popup_name: "several_qol_common_popup",
      type: "common",
      $dom_element: generatePopupDOM,
      close_on_esc: true,
      addEventListeners: function () {
        console.log("adding event listeners common popup");
        this.$dom_element.find("close, .popup_background").on("click", () => {
          this.destroy();
        });
      },
      removeEventListeners() {
        console.log("removing event listeners common popup");
      },
      onOpen() {
        console.log("opening common popup");
        $("#common-popups").append(this.$dom_element);
      },
      onClose() {
        console.log("closing common popup");
      },
      destroy: function () {
        console.log("destroying common popup");
        shared.PopupQueueManager.close({
          type: "common",
        });
      },
    };
    shared.PopupQueueManager.add({popup:generatedPopup});
    generatedPopup.init(true);
    return generatedPopup;
  }
}
