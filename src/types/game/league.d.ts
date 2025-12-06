export interface LeagueOpponentIncomplete {
  // XXX  extends OpponentFighter
  // very very incomplete x)
  place: number;
  player: {
    id_fighter: number;
  };
  Several_QoL?: {
    // added by the script
    checkExpiresAt: number;
    bestPlace: number;
    timesReached: number;
  };
}
