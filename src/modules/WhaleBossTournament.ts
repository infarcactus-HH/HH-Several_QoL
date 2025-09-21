import { HHModule } from "../types/HH++";

const configSchema = {
    baseKey : "whaleBossTournament",
    label: "Renames WBT to Whale Boss Tournament",
    default: false,
} as const;

export default class WhaleBossTournament extends HHModule<typeof configSchema> {
    constructor() {
        super(configSchema);
    }
    shouldRun() {
        return location.pathname.includes("/home.html");
    }
    run() {
        if (this.hasRun || !this.shouldRun()) {
            return;
        }
        this.hasRun = true;
        unsafeWindow.HHPlusPlus.Helpers.doWhenSelectorAvailable(".world-boss .title", () => {
            $(".world-boss .title").text("Whale Boss Tournament");
        })
    }
}