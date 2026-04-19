import React from 'react';
import styled, { useTheme, type DefaultTheme } from 'styled-components/native';
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
  rank: number | null;
}

function rowBackground(rank: number | null, isCurrentUser: boolean, theme: DefaultTheme): string {
  if (isCurrentUser) return rgba(theme.colors.primary, 0.06);
  return theme.colors.white;
}

const RowContainer = styled.View<{ bg: string }>`
  flex-direction: row;
  align-items: center;
  height: 60px;
  padding-horizontal: ${Spaces.md}px;
  background-color: ${({ bg }: { bg: string }) => bg};
  border-bottom-width: 0.5px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
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
  width: 48px;
  align-items: flex-end;
  margin-left: ${Spaces.sm}px;
`;

const StatsCell = styled.View`
  justify-content: flex-end;
  width: 48px;
  margin-left: ${Spaces.md}px;
`;

const StatItem = styled.View`
  align-items: flex-end;
`;

const RankNum = styled.Text<{ color: string }>`
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.display};
  font-size: ${RFValue(TextSizes.md)}px;
  color: ${({ color }: { color: string }) => color};
  text-align: center;
`;

const PointsNum = styled.Text<{ color: string }>`
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.display};
  font-size: ${RFValue(TextSizes.lg)}px;
  color: ${({ color }: { color: string }) => color};
  text-align: right;
`;

function RankDisplay({ rank, theme }: { rank: number | null; theme: DefaultTheme }) {
  if (rank == null) {
    return (
      <AppText size="sm" color={theme.colors.text_disabled} align="center">
        -
      </AppText>
    );
  }

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
      <RankNum color={theme.colors.text_gray} style={{ fontVariant: ['tabular-nums'] }}>
        {rank.toString()}
      </RankNum>
    );
  }
  return (
    <RankNum color={theme.colors.text_disabled} style={{ fontVariant: ['tabular-nums'] }}>
      {rank.toString()}
    </RankNum>
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
        name={entry.user.name}
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
        <PointsNum color={theme.colors.primary} style={{ fontVariant: ['tabular-nums'] }}>
          {entry.totalPoints}
        </PointsNum>
      </PointsCell>

      <StatsCell>
        <StatItem>
          <AppText size="xsm" color={theme.colors.positive}>
            {entry.exactScoresCount}
          </AppText>
        </StatItem>
      </StatsCell>
    </RowContainer>
  );
}
