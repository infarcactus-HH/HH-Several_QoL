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
}
