export class TooltipHook {
  private static _instance: TooltipHook | null = null;
  currentTarget: HTMLElement | null = null;
  tooltipOverrides: Array<{
    selector: string;
    override: (currentTarget: HTMLElement, tooltipElement: HTMLElement) => void;
  }> = [];

  private constructor() {
    this.hookTooltip();
    this.startHoverListener();
  }

  public static getInstance(): TooltipHook {
    if (!TooltipHook._instance) {
      TooltipHook._instance = new TooltipHook();
    }
    return TooltipHook._instance;
  }

  public addTooltipOverride(
    selector: string,
    override: (currentTarget: HTMLElement, tooltipElement: HTMLElement) => void,
  ) {
    this.tooltipOverrides.push({ selector, override });
  }

  private hookTooltip() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if ((node as Element).matches?.(".hh_tooltip_new.QoL-custom-tooltip")) {
            console.log("Tooltip added:", node);
            console.log("Current target for tooltip:", this.currentTarget);
            for (const { selector, override } of this.tooltipOverrides) {
              if ((node as HTMLElement).matches(selector)) {
                override(this.currentTarget!, node as HTMLElement);
              }
            }
          }
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
    });
    console.log("Observer started on body");
  }
  private startHoverListener() {
    $("body").on("mouseenter touchstart", "[tooltip]", (e) => {
      this.currentTarget = e.currentTarget;
    });
  }
}
