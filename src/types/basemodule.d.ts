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
