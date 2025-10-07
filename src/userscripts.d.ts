import { popupForQueue } from "./types/GameTypes";

declare global {
    let unsafeWindow: UnsafeWindow;

    namespace GM {
        function addStyle(css: string): HTMLStyleElement;
        function openInTab(url: string, options?: { active: boolean }): void;
    }

    const shared: {
        PopupQueueManager: {
            add(options: { popup: popupForQueue }): void;
            close(options: { type: string }): void;
        }
        general: any;
        reward_popup: any;
        reward: any;
        animations: any;
        timer: any;
    };
    
    const GT: any;
    const IMAGES_URL: string;

    function GM_addStyle(css: string): HTMLStyleElement;
    function number_format_lang(num: number): string;
    function GM_setValue(key: string, value: any): void;
    function GM_getValue(key: string, defaultValue?: any): any;
    function GM_deleteValue(key: string): void;
}

export {};
