import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { rgba } from 'polished';
import { RFValue } from 'react-native-responsive-fontsize';
import { TextSizes, Spaces, IconSizes } from '@/constants/tokens';
import AppText from '@/components/AppComponents/AppText';
import AppAvatar from '@/components/AppComponents/AppAvatar';

export type LeaderboardEntry = {
  poolId: number;
  userId: string;
  totalPoints: number;
  exactScoresCount: number;
  correctWinnersCount: number;
  rank: number | null;
  lastUpdated: string | null;
  user: {
    id: string;
    name: string;
    profileImageUrl: string | null;
  };
};

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  rank: number;
}

function rowBackground(rank: number, isCurrentUser: boolean, theme: any): string {
  if (isCurrentUser) return rgba(theme.colors.primary, 0.06);
  if (rank === 1) return rgba(theme.colors.secondary, 0.08);
  if (rank === 2 || rank === 3) return rgba(theme.colors.shape, 0.5);
  return theme.colors.white;
}

const RowContainer = styled.View<{ bg: string }>`
  flex-direction: row;
  align-items: center;
  height: 60px;
  padding-horizontal: ${Spaces.md}px;
  background-color: ${({ bg }) => bg};
  border-bottom-width: 0.5px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const RankCell = styled.View`
  min-width: 36px;
  align-items: center;
  justify-content: center;
`;

const NameCell = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  margin-horizontal: ${Spaces.sm}px;
`;

const PointsCell = styled.View`
  align-items: flex-end;
  margin-left: ${Spaces.sm}px;
`;

const StatsCell = styled.View`
  align-items: flex-end;
  margin-left: ${Spaces.md}px;
`;

const StatItem = styled.View`
  align-items: flex-end;
`;

function RankDisplay({ rank, theme }: { rank: number; theme: any }) {
  if (rank === 1) {
    return (
      <Ionicons
        name="trophy"
        size={IconSizes.sm}
        color={theme.colors.secondary}
      />
    );
  }
  if (rank === 2 || rank === 3) {
    return (
      <AppText bold size="sm" color={theme.colors.text_gray} align="center">
        {rank.toString()}
      </AppText>
    );
  }
  return (
    <AppText size="sm" color={theme.colors.text_disabled} align="center">
      {rank.toString()}
    </AppText>
  );
}

export default function LeaderboardRow({
  entry,
  isCurrentUser,
  rank,
}: LeaderboardRowProps) {
  const theme = useTheme();
  const bg = rowBackground(rank, isCurrentUser, theme);

  return (
    <RowContainer bg={bg}>
      <RankCell>
        <RankDisplay rank={rank} theme={theme} />
      </RankCell>

      <AppAvatar
        imagePath={entry.user.profileImageUrl ?? undefined}
        size={IconSizes.lg}
      />

      <NameCell>
        <AppText
          bold={isCurrentUser}
          size="sm"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ flex: 1 }}
        >
          {entry.user.name}
        </AppText>
        {isCurrentUser && (
          <AppText size="xsm" color={theme.colors.text_gray}>
            {' '}(você)
          </AppText>
        )}
      </NameCell>

      <PointsCell>
        <AppText bold size="md" color={theme.colors.primary}>
          {entry.totalPoints}
        </AppText>
        <AppText size="xsm" color={theme.colors.text_gray}>
          pts
        </AppText>
      </PointsCell>

      <StatsCell>
        <StatItem>
          <AppText size="xsm" color={theme.colors.positive}>
            {entry.exactScoresCount}
          </AppText>
          <AppText size="xsm" color={theme.colors.text_disabled}>
            exatos
          </AppText>
        </StatItem>
        <StatItem>
          <AppText size="xsm" color={theme.colors.text_gray}>
            {entry.correctWinnersCount}
          </AppText>
          <AppText size="xsm" color={theme.colors.text_disabled}>
            vencedor
          </AppText>
        </StatItem>
      </StatsCell>
    </RowContainer>
  );
}
