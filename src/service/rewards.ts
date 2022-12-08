import { SeasonDetails } from "./localData";

interface Rewards {
  shardOfGlory: number;
  unidentifiedDye: number;
  gold: number;
  transmutationCharge: number;
  warlordArmorBox: number;
  ascendedShardOfGlory: number;
  pvpLeagueTicket: number;
  boxOfGrandmasterMarks: number;
  llamaMiniChoiceBox: number;
}

const emptyReward: Rewards = {
  shardOfGlory: 0,
  unidentifiedDye: 0,
  gold: 0,
  transmutationCharge: 0,
  warlordArmorBox: 0,
  ascendedShardOfGlory: 0,
  pvpLeagueTicket: 0,
  boxOfGrandmasterMarks: 0,
  llamaMiniChoiceBox: 0,
};

function calculateReward(
  tiers: number,
  tierReward: Partial<Rewards>,
  finalReward: Partial<Rewards>
): Rewards {
  let result = { ...emptyReward };

  for (let i = 1; i <= tiers; i++) {
    if (i === tiers) {
      addReward(result, finalReward);
    } else {
      addReward(result, tierReward);
    }
  }

  return result;
}

function addReward(base: Rewards, add: Partial<Rewards>) {
  for (let _k in add) {
    const k = _k as keyof Rewards;
    base[k] += add[k] ?? 0;
  }
}

const regularRewards: Array<Rewards> = [
  // Cerulean
  calculateReward(
    3,
    {
      shardOfGlory: 3,
      unidentifiedDye: 1,
      gold: 30_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 10,
      unidentifiedDye: 2,
      warlordArmorBox: 1,
      pvpLeagueTicket: 10,
      gold: 5_00_00,
      transmutationCharge: 1,
      ascendedShardOfGlory: 25,
    }
  ),
  // Jasper
  calculateReward(
    4,
    {
      shardOfGlory: 10,
      unidentifiedDye: 1,
      gold: 45_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 15,
      unidentifiedDye: 2,
      warlordArmorBox: 1,
      pvpLeagueTicket: 10,
      gold: 5_00_00,
      transmutationCharge: 3,
      ascendedShardOfGlory: 50,
    }
  ),
  // Saffron
  calculateReward(
    5,
    {
      shardOfGlory: 15,
      unidentifiedDye: 1,
      gold: 60_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 20,
      unidentifiedDye: 2,
      warlordArmorBox: 1,
      pvpLeagueTicket: 15,
      gold: 10_00_00,
      transmutationCharge: 3,
      ascendedShardOfGlory: 75,
    }
  ),
  // Persimmon
  calculateReward(
    5,
    {
      shardOfGlory: 20,
      unidentifiedDye: 1,
      gold: 75_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 25,
      unidentifiedDye: 2,
      warlordArmorBox: 1,
      boxOfGrandmasterMarks: 1,
      pvpLeagueTicket: 15,
      gold: 10_00_00,
      transmutationCharge: 5,
      ascendedShardOfGlory: 75,
    }
  ),
  // Amaranth
  calculateReward(
    5,
    {
      shardOfGlory: 25,
      unidentifiedDye: 1,
      gold: 1_00_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 30,
      unidentifiedDye: 2,
      warlordArmorBox: 2,
      boxOfGrandmasterMarks: 1,
      pvpLeagueTicket: 25,
      gold: 15_00_00,
      transmutationCharge: 5,
      ascendedShardOfGlory: 75,
    }
  ),
  // Byzantium
  calculateReward(
    6,
    {
      shardOfGlory: 30,
      unidentifiedDye: 1,
      gold: 1_50_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 30,
      unidentifiedDye: 2,
      llamaMiniChoiceBox: 1,
      boxOfGrandmasterMarks: 1,
      warlordArmorBox: 2,
      pvpLeagueTicket: 25,
      gold: 20_00_00,
      transmutationCharge: 5,
      ascendedShardOfGlory: 100,
    }
  ),
  // Byzantium (Repeatable)
  calculateReward(
    6,
    {
      shardOfGlory: 30,
      unidentifiedDye: 1,
      gold: 1_50_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 30,
      unidentifiedDye: 1,
      gold: 20_00_00,
      transmutationCharge: 2,
      ascendedShardOfGlory: 100,
    }
  ),
];

const mini2v2Rewards: Array<Rewards> = [
  // Cerulean
  calculateReward(
    3,
    {
      shardOfGlory: 5,
      unidentifiedDye: 1,
      gold: 30_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 10,
      unidentifiedDye: 2,
      warlordArmorBox: 1,
      pvpLeagueTicket: 10,
      gold: 5_00_00,
      transmutationCharge: 1,
      ascendedShardOfGlory: 25,
    }
  ),
  // Jasper
  calculateReward(
    4,
    {
      shardOfGlory: 10,
      unidentifiedDye: 1,
      gold: 45_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 15,
      unidentifiedDye: 2,
      warlordArmorBox: 1,
      pvpLeagueTicket: 10,
      gold: 5_00_00,
      transmutationCharge: 3,
      ascendedShardOfGlory: 50,
    }
  ),
  // Saffron
  calculateReward(
    5,
    {
      shardOfGlory: 15,
      unidentifiedDye: 1,
      gold: 60_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 20,
      unidentifiedDye: 2,
      warlordArmorBox: 1,
      pvpLeagueTicket: 15,
      gold: 10_00_00,
      transmutationCharge: 3,
      ascendedShardOfGlory: 75,
    }
  ),
  // Persimmon
  calculateReward(
    5,
    {
      shardOfGlory: 20,
      unidentifiedDye: 1,
      gold: 75_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 25,
      unidentifiedDye: 2,
      boxOfGrandmasterMarks: 1,
      warlordArmorBox: 1,
      pvpLeagueTicket: 15,
      gold: 10_00_00,
      transmutationCharge: 5,
      ascendedShardOfGlory: 75,
    }
  ),
  // Persimmon (Repeatable)
  calculateReward(
    5,
    {
      shardOfGlory: 20,
      unidentifiedDye: 1,
      gold: 75_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 25,
      unidentifiedDye: 1,
      gold: 5_00_00,
      transmutationCharge: 1,
      ascendedShardOfGlory: 25,
    }
  ),
];

const mini3v3Rewards: Array<Rewards> = [
  // Cerulean
  calculateReward(
    3,
    {
      shardOfGlory: 5,
      unidentifiedDye: 1,
      gold: 30_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 10,
      unidentifiedDye: 2,
      warlordArmorBox: 1,
      pvpLeagueTicket: 10,
      gold: 5_00_00,
      transmutationCharge: 1,
      ascendedShardOfGlory: 25,
    }
  ),
  // Jasper
  calculateReward(
    4,
    {
      shardOfGlory: 10,
      unidentifiedDye: 1,
      gold: 45_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 15,
      unidentifiedDye: 2,
      warlordArmorBox: 1,
      pvpLeagueTicket: 10,
      gold: 5_00_00,
      transmutationCharge: 3,
      ascendedShardOfGlory: 50,
    }
  ),
  // Saffron
  calculateReward(
    5,
    {
      shardOfGlory: 15,
      unidentifiedDye: 1,
      gold: 60_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 25,
      unidentifiedDye: 2,
      warlordArmorBox: 1,
      pvpLeagueTicket: 15,
      gold: 10_00_00,
      transmutationCharge: 5,
      ascendedShardOfGlory: 75,
      boxOfGrandmasterMarks: 1,
    }
  ),
  // Saffron (Repeatable)
  calculateReward(
    5,
    {
      shardOfGlory: 15,
      unidentifiedDye: 1,
      gold: 60_00,
      transmutationCharge: 1,
    },
    {
      shardOfGlory: 25,
      unidentifiedDye: 1,
      gold: 4_00_00,
      transmutationCharge: 1,
      ascendedShardOfGlory: 20,
    }
  ),
];

export function getRewardForGoal(
  season: SeasonDetails | null,
  divisions: number,
  repeats: number
) {
  if (!season) return emptyReward;

  const rewards =
    season.type === "3v3"
      ? mini3v3Rewards
      : season.type === "2v2"
      ? mini2v2Rewards
      : regularRewards;
  const result = { ...emptyReward };

  for (let i = 0; i < divisions; i++) {
    addReward(result, rewards[i]);
  }
  for (let i = 0; i < repeats; i++) {
    addReward(result, rewards[rewards.length - 1]);
  }

  return result;
}
