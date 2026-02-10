import { allOrbsType } from "../items";

// soft_currency/ticket entries mirror BasicRewards items of the same type.
export type HeroChangesCurrencyUpdate = {
  currency?: {
    soft_currency?: number; // owned total amount
    ticket?: number; // owned total amount
  };
  soft_currency?: number; // drop amount, matches soft_currency reward entry
};

export type HeroChangesUpdate =
  | ((HeroChangesCurrencyUpdate | {}) &
      (KissEnergyUpdate | {}) &
      (QuestEnergyUpdate | {}) &
      (OrbChangesUpdate | {}) &
      (WorshipEnergyUpdate | {}) &
      (ChallengeEnergyUpdate | {}) &
      (FightEnergyUpdate | {}) &
      (DrillEnergyUpdate | {}))
  | [];

export type KissEnergyUpdate = {
  energy_kiss: number;
  energy_kiss_recharge_time: number;
  ts_kiss: number;
};

export type QuestEnergyUpdate = {
  energy_quest: number;
  energy_quest_recharge_time: number;
  ts_quest: number;
};

export type WorshipEnergyUpdate = {
  energy_worship: number;
  energy_worship_recharge_time: number;
  ts_worship: number;
};

export type ChallengeEnergyUpdate = {
  energy_challenge: number;
  energy_challenge_recharge_time: number;
  ts_challenge: number;
};

export type FightEnergyUpdate = {
  energy_fight: number;
  energy_fight_recharge_time: number;
  ts_fight: number;
};

export type DrillEnergyUpdate = {
  energy_drill: number;
  energy_drill_recharge_time: number;
  ts_drill: number;
};

export type OrbChangesUpdate =
  | Partial<Record<allOrbsType, number>> // owned total amount for each orb type
  | [];
