import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';
import { IconSizes } from '@/constants/tokens';
import AppText from '../AppText';
import { StarsContainer } from './styles';

interface AppStarsScoreProps {
  scoreTotal?: number;
  reviewCount?: number;
  size?: 'xlg' | 'lg' | 'md' | 'sm' | 'xsm';
  format?: 'stars' | 'numbers';
}

export default function AppStarsScore({
  scoreTotal = 1,
  reviewCount = 1,
  size = 'md',
  format = 'stars',
}: AppStarsScoreProps) {
  const theme = useTheme();

  const avg = scoreTotal / reviewCount;
  const fullStars = Math.floor(avg);
  const hasHalfStar = avg % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  if (format === 'stars') {
    return (
      <StarsContainer>
        {Array(fullStars)
          .fill(null)
          .map((_, i) => (
            <FontAwesome key={`full-${i}`} name="star" size={IconSizes[size]} color="gold" />
          ))}
        {hasHalfStar && (
          <FontAwesome name="star-half-empty" size={IconSizes[size]} color="gold" />
        )}
        {Array(emptyStars)
          .fill(null)
          .map((_, i) => (
            <FontAwesome key={`empty-${i}`} name="star-o" size={IconSizes[size]} color="gold" />
          ))}
      </StarsContainer>
    );
  }

  return (
    <StarsContainer style={{ flexDirection: 'row', alignItems: 'center' }}>
      <FontAwesome name="star" size={IconSizes[size] + 4} color="gold" />
      <AppText bold size={size} color={theme.colors.text_dark}>
        {avg.toFixed(1)}
        <AppText size="xsm" color={theme.colors.text_gray}>
          {' '}/ {reviewCount} reviews{' '}
        </AppText>
      </AppText>
    </StarsContainer>
  );
}
