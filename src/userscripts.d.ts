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
    };
    general: any;
    reward_popup: any;
    reward: any;
    animations: {
      loadingAnimation: {
        start: () => void;
        stop: () => void;
        isLoading: boolean;
      };
    };
    timer: {
      buildTimer: (
        timeToFinishInSeconds: number,
        text: string,
        className: string,
        marketClock?: boolean
      ) => string; // returns the html string
      activateTimers: (
        className: string, // classname is wonky here. The selector they make adds a dot before it but you can add more after
        callback: (timer: {
          $dom_element: JQuery<HTMLElement>; // self
          next_tick: number; // ??
          onComplete: () => void; // the callback
          time_remaining: 0; // should always be 0 here
          timeout_id: number; // unknown
        }) => void
      ) => void; // careful to not activate multiple time the same timer
    };
    Hero: any;
  };

  const GT: any;
  const IMAGES_URL: string;
  const HH_UNIVERSE: string;
  const server_now_ts: number;

  function GM_addStyle(css: string): HTMLStyleElement;
  function number_format_lang(num: number): string;
  function GM_setValue(key: string, value: any): void;
  function GM_getValue(key: string, defaultValue?: any): any;
  function GM_deleteValue(key: string): void;
}
