export class HHPlusPlusReplacer {
  static doWhenSelectorAvailable(selector: string, callback: Function) {
    if ($(selector).length) {
      callback();
    } else {
      const observer = new MutationObserver(() => {
        if ($(selector).length) {
          observer.disconnect();
          callback();
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  }
  static conditionalDoWhenSelectorAvailable(
    condition: ($el: JQuery<HTMLElement>) => boolean,
    selector: string,
    callback: Function
  ) {
    if (condition($(selector))) {
      callback();
    } else {
      const observer = new MutationObserver(() => {
        if (condition($(selector))) {
          observer.disconnect();
          callback();
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  }
}
