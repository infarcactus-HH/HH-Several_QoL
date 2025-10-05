declare let unsafeWindow: UnsafeWindow;

declare namespace GM {
    function addStyle(css: string): HTMLStyleElement;
    function openInTab(url: string, options?: { active: boolean }): void;
}

declare let shared: any;
declare const GT: any;
declare const IMAGES_URL: string;


declare function GM_addStyle(css: string): HTMLStyleElement;

declare function number_format_lang(num: number): string;
