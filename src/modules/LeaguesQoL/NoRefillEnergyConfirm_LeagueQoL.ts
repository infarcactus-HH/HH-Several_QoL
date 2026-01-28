import { SubModule } from "../../base";

export default class NoRefillEnergyConfirm implements SubModule {
  run() {
    shared.Hero.infos.hc_confirm = true;
  }
}
