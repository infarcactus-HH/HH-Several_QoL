import { popupForQueue } from "./types/GameTypes";

export declare global {
  const shared: {
    PopupQueueManager: {
      add(options: popupForQueue): void;
      close(options: { type: string }): void;
    };
    general: {
        hc_confirm: (price: string, callback: () => void) => void; // opens the confirm popup for premium spending
        hh_ajax: (options: {[key: string]: any}, callback: (response : any) => void) => void; // jQuery ajax wrapper for HH games
        navigate(url: string): void; // navigate to a new page
        getDocumentHref(url: string): string; // get the full URL for a relative URL (useful for completing sessIds)
        objectivePopup : any;
    };
    reward_popup: any;
    reward: any;
    animations: {
      loadingAnimation: { // useful when you don't want the user to do actions
        start() : void;
        stop() : void;
        isLoading: boolean;
      };
    };
    timer: {
      buildTimer(
        timeToFinishInSeconds: number,
        text: string,
        className: string,
        marketClock?: boolean
      ) : string; // returns the html string
      activateTimers(
        className: string, // classname is wonky here. The selector they make adds a dot before it but you can add more after
        callback: (timer: {
          $dom_element: JQuery<HTMLElement>; // self
          next_tick: number; // ??
          onComplete: () => void; // the callback
          time_remaining: 0; // should always be 0 here ?
          timeout_id: number; // unknown
        }) => void
      ) : void; // careful to not activate multiple time the same timer
    };
    Hero: any;
  };

  const GT: any;
  const IMAGES_URL: string; // get the base url for images
  const HH_UNIVERSE: string; // get the string of the current universe (different for games & nutaku vs .com)
  const server_now_ts: number; // Server simply sends Date.now()/1000
  function number_format_lang(num: number): string;
}