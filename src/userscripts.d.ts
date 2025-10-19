export declare global {
  let unsafeWindow: UnsafeWindow;

  namespace GM {
    function addStyle(css: string): HTMLStyleElement;
    function openInTab(url: string, options?: { active: boolean }): void;
  }
  function GM_addStyle(css: string): HTMLStyleElement;
  function GM_setValue(key: string, value: any): void;
  function GM_getValue(key: string, defaultValue?: any): any;
  function GM_deleteValue(key: string): void;
  function GM_listValues(): string[];
  const GM_info: any;
}