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
            <img src="https://cdn.discordapp.com/attachments/1088116609094266922/1424849916831731842/dAPpwNB.png?ex=68e57264&is=68e420e4&hm=5da6549c6a8edfa33e17cc798c3dde3580727344a54f609d89e4e556a4d3c2fd&" alt="PoVInfo" />
        </div>
        <close class="closable"></close>
    </div>
    `);

    // Add custom styles
    GM.addStyle(`
    .popup_wrapper > #popup_PoVInfo {
        width: 1020px;
        height: 550px;
        top: 0.62rem;
        left: 0.62rem;
    }
    #popup_PoVInfo close {
        width: 2.4rem;
        height: 2.2rem;
        background-image: url(/images/clubs/ic_xCross.png);
        opacity: 1;
    }
    .PoVInfo-container {
        width: 100%;
        height: 100%;
        box-shadow: none;
        border: 2px solid #ff9900;
        align-content: center;
    }
    .PoVInfo-container img {
        height: -webkit-fill-available;
    }
    `);

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
