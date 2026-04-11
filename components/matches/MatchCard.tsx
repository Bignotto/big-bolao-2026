import { Image, Pressable, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import AppText from '@/components/AppComponents/AppText';
import { Match } from '@/domain/entities/Match';
import { BorderRadius } from '@/constants/tokens';

interface Props {
  match: Match;
  onPress: () => void;
  centerSubtext: string;
}

// ─── Styled primitives ───────────────────────────────────────────────────────

const Card = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${BorderRadius.md}px;
  padding: 12px 8px;
`;

const TeamBlock = styled(View)`
  width: 64px;
  align-items: center;
  gap: 4px;
`;

const CenterBlock = styled(View)`
  flex: 1;
  align-items: center;
  gap: 2px;
`;

const Separator = styled(View)`
  width: 40px;
  height: 0.5px;
  background-color: ${({ theme }) => theme.colors.border};
  margin-top: 4px;
`;

const FlagImage = styled(Image)`
  width: 36px;
  height: 24px;
  border-radius: 3px;
  border-width: 0.5px;
  border-color: ${({ theme }) => theme.colors.border};
`;

// ─── Flag sub-component ───────────────────────────────────────────────────────

interface FlagProps {
  flagUrl: string | null;
  countryCode: string | null;
}

function Flag({ flagUrl, countryCode }: FlagProps) {
  const theme = useTheme();

  if (flagUrl) {
    return <FlagImage source={{ uri: flagUrl }} resizeMode="cover" />;
  }

  return (
    <View
      style={{
        width: 36,
        height: 24,
        borderRadius: 3,
        backgroundColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText size="xsm" bold color={theme.colors.white}>
        {countryCode?.slice(0, 3) ?? '?'}
      </AppText>
    </View>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────

export default function MatchCard({ match, onPress, centerSubtext }: Props) {
  const theme = useTheme();
  const time = new Date(match.matchDatetime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <Card onPress={onPress}>
      <TeamBlock>
        <Flag flagUrl={match.homeTeam.flagUrl} countryCode={match.homeTeam.countryCode} />
        <AppText size="xsm" bold color={theme.colors.text} align="center">
          {match.homeTeam.countryCode ?? match.homeTeam.name}
        </AppText>
      </TeamBlock>

      <CenterBlock>
        <AppText size="sm" bold color={theme.colors.text}>
          {time}
        </AppText>
        <AppText size="xsm" color={theme.colors.text_gray}>
          {centerSubtext}
        </AppText>
        <Separator />
      </CenterBlock>

      <TeamBlock>
        <Flag flagUrl={match.awayTeam.flagUrl} countryCode={match.awayTeam.countryCode} />
        <AppText size="xsm" bold color={theme.colors.text} align="center">
          {match.awayTeam.countryCode ?? match.awayTeam.name}
        </AppText>
      </TeamBlock>
    </Card>
  );
}
