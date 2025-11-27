import { AlwaysRunningModule } from "../types/AlwaysRunningModules";

export default class CustomCSS extends AlwaysRunningModule {
    static shouldRun() {
        return location.pathname === "/home.html";
    }
    run() {
        if(location.pathname === "/home.html"){
            GM_addStyle(`h4.severalQoL.selected::after{content: 'v${GM_info.script.version}';display: block;position: absolute;top: -10px;right: -15px;font-size: 10px;}`);
        }
    }
}