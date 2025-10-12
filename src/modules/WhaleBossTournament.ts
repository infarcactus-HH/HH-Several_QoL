import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

const ConfigSchema = {
    baseKey : "whaleBossTournament",
    label: "Renames WBT to Whale Boss Tournament",
    default: false,
} as const;

export default class WhaleBossTournament extends HHModule<typeof ConfigSchema> {
    configSchema = ConfigSchema;
    shouldRun() {
        return location.pathname.includes("/home.html");
    }
    run() {
        if (this.hasRun || !this.shouldRun()) {
            return;
        }
        this.hasRun = true;
        HHPlusPlusReplacer.doWhenSelectorAvailable(".world-boss .title", () => {
            $(".world-boss .title").text("Whale Boss Tournament");
        })
    }
}