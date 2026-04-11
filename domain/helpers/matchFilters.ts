import { Match } from '../entities/Match';
import { MatchStage } from '../enums/MatchStage';

export function filterByGroup(matches: Match[], group: string): Match[] {
  return matches.filter((m) => m.stage === MatchStage.GROUP && m.group === group);
}

export function filterByStage(matches: Match[], stage: MatchStage): Match[] {
  return matches.filter((m) => m.stage === stage);
}

export function filterByDate(matches: Match[], date: string): Match[] {
  return matches.filter((m) => m.matchDatetime.startsWith(date));
}

export function getAvailableDates(matches: Match[]): string[] {
  const dates = matches.map((m) => m.matchDatetime.slice(0, 10));
  return [...new Set(dates)].sort();
}

/**
 * Given a pre-filtered list of matches from a single group, returns them
 * organised by derived round number. Matches are sorted chronologically and
 * paired into rounds (index 0–1 → round 1, 2–3 → round 2, etc.).
 */
export function groupByRound(groupMatches: Match[]): { round: number; matches: Match[] }[] {
  const sorted = [...groupMatches].sort(
    (a, b) => new Date(a.matchDatetime).getTime() - new Date(b.matchDatetime).getTime()
  );

  const roundMap = new Map<number, Match[]>();
  sorted.forEach((m, i) => {
    const round = Math.floor(i / 2) + 1;
    if (!roundMap.has(round)) roundMap.set(round, []);
    roundMap.get(round)!.push(m);
  });

  return [...roundMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([round, matches]) => ({ round, matches }));
}

/**
 * Given a filtered list of group-stage matches, derives round numbers by
 * sorting matches chronologically within each group and assigning round 1, 2, 3
 * based on order of appearance (each group plays in batches; matches are paired
 * by their position in the sorted list).
 *
 * Returns unique, sorted round numbers present in the provided list.
 */
export function getRounds(matches: Match[]): number[] {
  // Group matches by their .group value
  const byGroup = new Map<string, Match[]>();
  for (const m of matches) {
    const key = m.group ?? '__ungrouped__';
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key)!.push(m);
  }

  // Build a map of matchId → round number derived from chronological order
  const matchRound = new Map<number, number>();

  for (const groupMatches of byGroup.values()) {
    const sorted = [...groupMatches].sort(
      (a, b) => new Date(a.matchDatetime).getTime() - new Date(b.matchDatetime).getTime()
    );
    // Each round consists of 2 matches (one per pair of teams in the group).
    // Assign round by index: index 0-1 → round 1, 2-3 → round 2, 4-5 → round 3, etc.
    sorted.forEach((m, i) => {
      matchRound.set(m.id, Math.floor(i / 2) + 1);
    });
  }

  const rounds = new Set<number>();
  for (const m of matches) {
    const round = matchRound.get(m.id);
    if (round !== undefined) rounds.add(round);
  }

  return [...rounds].sort((a, b) => a - b);
}
