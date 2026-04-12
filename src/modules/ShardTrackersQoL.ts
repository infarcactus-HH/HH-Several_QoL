import { HHModule, HHModule_ConfigSchema, SubSettingsType } from "../base";
import runTimingHandler from "../runTimingHandler";
import VillainShardTracker from "./ShardTracker/VillainShardTracker";
import SeasonShardTracker from "./ShardTracker/SeasonShardTracker";

type ShardTrackersQoL_configSchema = {
  baseKey: "shardTrackersQoL";
  label: "Shard Trackers QoL:";
  default: true;
  subSettings: [
    {
      key: "villainShardTracker";
      label: "Enable villain shard tracker";
      default: true;
    },
    {
      key: "seasonShardTracker";
      label: "Enable season shard tracker";
      default: true;
    },
  ];
};

export default class ShardTrackersQoL extends HHModule {
  readonly configSchema: HHModule_ConfigSchema = {
    baseKey: "shardTrackersQoL",
    label: "Shard Trackers QoL:",
    default: true,
    subSettings: [
      {
        key: "villainShardTracker",
        label: "Villain shard tracker",
        default: true,
      },
      {
        key: "seasonShardTracker",
        label: "Season shard tracker",
        default: true,
      },
    ],
  };

  static shouldRun_() {
    return (
      location.pathname.includes("/troll-pre-battle.html") ||
      location.pathname.includes("/troll-battle.html") ||
      location.pathname.includes("/season-arena.html") ||
      location.pathname.includes("/season-battle.html")
    );
  }

  async run(subSettings: SubSettingsType<ShardTrackersQoL_configSchema>) {
    if (this._hasRun || !ShardTrackersQoL.shouldRun_()) {
      return;
    }

    this._hasRun = true;
    await runTimingHandler.afterGameScriptsRun_();

    if (subSettings.villainShardTracker) {
      await new VillainShardTracker().run_();
    }

    if (subSettings.seasonShardTracker) {
      await new SeasonShardTracker().run_();
    }
  }
}
