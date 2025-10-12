export interface HHModule_ConfigSchema {
  baseKey: string;
  label: string;
  default: boolean;
  subSettings?: readonly {
    key: string;
    default: boolean;
    label: string;
  }[];
}


export type SubSettingsType<T extends HHModule_ConfigSchema> = T['subSettings'] extends readonly { key: string; default: boolean; label: string }[]
  ? { [K in T['subSettings'][number]['key']]: boolean }
  : undefined;

export abstract class HHModule<TConfig extends HHModule_ConfigSchema = HHModule_ConfigSchema> {
  public group = "severalQoL";
  public configSchema: TConfig;
  protected hasRun = false;
  
  constructor(configSchema: TConfig) {
    this.configSchema = configSchema;
  }
  
  // Keep it simple - let implementations use the helper type explicitly
  abstract run(subSettings: SubSettingsType<TConfig>): void;
  abstract shouldRun(): boolean;
}
