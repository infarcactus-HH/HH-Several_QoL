import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

const configSchema = {
  baseKey: "povInfo",
  label: "PoV Info",
  default: true,
} as const;

export default class PoVInfo extends HHModule {
  constructor() {
    super(configSchema);
  }
  shouldRun() {
    return location.pathname.includes("/path-of-valor.html");
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    HHPlusPlusReplacer.doWhenSelectorAvailable(".potions-paths-objective > h4", ()=>{
        $(".potions-paths-objective > h4").text("PoV Info (click)");
        $(".potions-paths-objective > h4").css("cursor","pointer")
        $(".potions-paths-objective > h4").on("click",()=>{
            this.activatePopup()
        })
    })
  }

  activatePopup() {
    const $popupContent = $(`
    <div class="popup_background clickable"></div>
    <div id="popup_PoVInfo" class="popup">
        <div class="PoVInfo-container container-special-bg">
            <span class="PoVInfo-title">Path of Valor Info</span>
            <p>PoV cycle through those goals in order</p>
            <img src="https://raw.githubusercontent.com/infarcactus-HH/HH-Several_QoL/refs/heads/main/images/PoVInfo.png" alt="PoVInfo" />
        </div>
        <close class="closable"></close>
    </div>
    `);

    // Add custom styles
    const css = require("./css/PoVInfo.css").default;
    GM.addStyle(css);

    const PoVPopup = {
      type: "common" as const,
      init: (t: boolean) => {
        console.log("init pov info popup", t);
        const n = $(`#common-popups`);
        PoVPopup.$dom_element.empty().append($popupContent);
        n.append(PoVPopup.$dom_element);
      },
      destroy: () => {
        console.log("destroy pov info popup");
        shared.PopupQueueManager.close({
          type: "common",
        });
      },
      onClose: () => {},
      onOpen: () => {},
      $dom_element: $(`<div class="popup_wrapper"></div>`),
      popup_name: "pov_info",
      close_on_esc: true,
      addEventListeners: () => {
        console.log("add event listeners pov info popup");
        PoVPopup.$dom_element.find("close.closable").on("click", () => {
          PoVPopup.destroy();
        });
        PoVPopup.$dom_element
          .find(".popup_background.clickable")
          .on("click", () => {
            PoVPopup.destroy();
          });
      },
      removeEventListeners: () => {},
    };

    shared.PopupQueueManager.add({
      popup: PoVPopup,
    });
  }
}
