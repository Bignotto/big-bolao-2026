# Big Bolão — Data Models (TypeScript)

User
{
id: string; // CUID
fullName: string;
email: string; // unique
passwordHash: string | null;
profileImageUrl: string | null;
createdAt: string;
lastLogin: string | null;
accountId: string | null;
accountProvider: 'GOOGLE' | 'APPLE' | 'EMAIL';
role: 'USER' | 'ADMIN';
}

Tournament
{
id: number;
name: string;
startDate: string;
endDate: string;
logoUrl: string | null;
status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
createdAt: string;
// computed
totalMatches: number;
completedMatches: number;
totalTeams: number;
totalPools: number;
}

Team
{
id: number;
name: string;
countryCode: string | null;
flagUrl: string | null;
createdAt: string;
}

Match
{
id: number;
tournamentId: number;
homeTeamId: number;
awayTeamId: number;
matchDatetime: string;
stadium: string | null;
stage: 'GROUP' | 'ROUND_OF_32' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL' | 'THIRD_PLACE' | 'LOSERS_MATCH';
group: string | null;
homeTeamScore: number | null;
awayTeamScore: number | null;
matchStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED';
hasExtraTime: boolean;
hasPenalties: boolean;
penaltyHomeScore: number | null;
penaltyAwayScore: number | null;
createdAt: string;
updatedAt: string | null;
homeTeam: Team;
awayTeam: Team;
tournament: Tournament;
}

Pool
{
id: number;
tournamentId: number;
name: string;
description: string | null;
creatorId: string;
isPrivate: boolean;
inviteCode: string | null;
createdAt: string;
maxParticipants: number | null;
registrationDeadline: string | null;
// computed
participantsCount: number;
isCreator: boolean;
isParticipant: boolean;
scoringRules: ScoringRule;
}

ScoringRule
{
id: number;
poolId: number;
exactScorePoints: number;
correctWinnerGoalDiffPoints: number;
correctWinnerPoints: number;
correctDrawPoints: number;
specialEventPoints: number;
knockoutMultiplier: number;
finalMultiplier: number;
}

Prediction
{
id: number;
poolId: number;
matchId: number;
userId: string;
predictedHomeScore: number;
predictedAwayScore: number;
predictedHasExtraTime: boolean;
predictedHasPenalties: boolean;
predictedPenaltyHomeScore: number | null;
predictedPenaltyAwayScore: number | null;
submittedAt: string;
updatedAt: string | null;
pointsEarned: number | null;
}

MatchPredictionStatus
{
poolId: number;
poolName: string;
matchId: number;
prediction: { ...Prediction fields... } | null;
userRank: number | null;
}

Leaderboard Entry
{
poolId: number;
userId: string;
totalPoints: number;
exactScoresCount: number;
correctWinnersCount: number;
rank: number | null;
lastUpdated: string | null;
user: User;
}
