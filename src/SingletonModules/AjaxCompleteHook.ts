import runTimingHandler from "../runTimingHandler";

export default class AjaxCompleteHook {
  private static _instance: AjaxCompleteHook | null = null;
  private _callbacks: Array<
    (event: JQuery.TriggeredEvent, xhr: JQuery.jqXHR, settings: JQuery.AjaxSettings) => void
  > = [];
  private _ajaxHistory: Array<{
    event: JQuery.TriggeredEvent;
    xhr: JQuery.jqXHR;
    settings: JQuery.AjaxSettings;
  }> = [];

  private constructor() {
    this._HookAjaxComplete();
  }
  private async _HookAjaxComplete() {
    await runTimingHandler.afterJQueryLoaded_();
    $(document).ajaxComplete((event, xhr, settings) => {
      this._ajaxHistory.push({ event, xhr, settings });
      this._callbacks.forEach(async (callback) => callback(event, xhr, settings));
    });
  }

  public static getInstance_(): AjaxCompleteHook {
    if (!AjaxCompleteHook._instance) {
      AjaxCompleteHook._instance = new AjaxCompleteHook();
    }
    return AjaxCompleteHook._instance;
  }
  public static async init_() {
    if (!AjaxCompleteHook._instance) {
      AjaxCompleteHook._instance = new AjaxCompleteHook();
    }
  }

  public addCallback_(
    callback: (
      event: JQuery.TriggeredEvent,
      xhr: JQuery.jqXHR,
      settings: JQuery.AjaxSettings,
    ) => void,
    replayHistory: boolean = true,
  ): void {
    this._callbacks.push(callback);
    // Replay history for the new callback
    if (replayHistory) {
      this._ajaxHistory.forEach(({ event, xhr, settings }) => {
        callback(event, xhr, settings);
      });
    }
  }
}
