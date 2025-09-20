import { HHModule } from "../../types/HH++";

export default class RaidsPlusPlus extends HHModule {
  private observer: MutationObserver | null = null;

  constructor() {
    const baseKey = "raidsPlusPlus";
    const configSchema = {
      baseKey,
      label: "Raids++",
      default: true,
    };
    super(configSchema);
  }
  shouldRun() {
    return false;//location.pathname.includes("/love-raids.html");
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;

    this.setupRaidsObserver();
  }

  private setupRaidsObserver() {
    function removeDoneRaids() {
      $(".raid-card.grey-overlay").remove();
    }
    const raidsContainer = document.querySelector(".love-raids-container")!; // always exist on page

    // Initial cleanup
    removeDoneRaids();

    // Create observer to watch for changes
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check if nodes were added (new raids loaded)
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Immediately check and remove any done raids from the added nodes
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check if the added node itself is a done raid
              if (element.matches(".raid-card.grey-overlay")) {
                element.remove();
                return;
              }
              
              // Check if any children of the added node are done raids
              const doneRaids = element.querySelectorAll(".raid-card.grey-overlay");
              doneRaids.forEach(raid => raid.remove());
            }
          });
        }
        
        // Check if attributes changed (raid status updates)
        if (
          mutation.type === "attributes" &&
          mutation.target instanceof Element &&
          mutation.target.classList.contains("raid-card") &&
          mutation.target.classList.contains("grey-overlay")
        ) {
          // Immediately remove if it just became a done raid
          (mutation.target as Element).remove();
        }
      });
    });

    // Start observing
    this.observer.observe(raidsContainer, {
      childList: true, // Watch for added/removed children
      subtree: true, // Watch all descendants
      attributes: true, // Watch for attribute changes
      attributeFilter: ["class"], // Only watch class changes
    });

  }

  // Clean up observer when module is destroyed
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
