export type PlayerLeagueRank = {
  league: number;
  rank: number;
};

export type StoredPlayerSeasonInfo = {
  previousTierThreshold: number;
  nextTierThreshold: number | undefined;
  mojo: number;
  name: string | undefined;
  tier: number;
};
