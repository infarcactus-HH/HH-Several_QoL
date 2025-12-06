export declare global {
  let unsafeWindow: UnsafeWindow;

  function GM_openInTab(url: string, options?: { active: boolean }): void;
  function GM_addStyle(css: string): HTMLStyleElement;
  function GM_setValue(key: string, value: any): void;
  function GM_getValue(key: string, defaultValue?: any): any;
  function GM_deleteValue(key: string): void;
  function GM_listValues(): string[];
  const GM_cookie: any;
  const GM_info: any;
}
