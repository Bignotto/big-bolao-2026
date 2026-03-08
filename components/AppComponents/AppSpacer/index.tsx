import { View } from 'react-native';
import { Spaces } from '@/constants/tokens';

type AppSpacerProps = {
  horizontalSpace?: 'xlg' | 'lg' | 'md' | 'sm' | 'xsm';
  verticalSpace?: 'xlg' | 'lg' | 'md' | 'sm' | 'xsm';
};

export default function AppSpacer({
  horizontalSpace = 'md',
  verticalSpace = 'md',
}: AppSpacerProps) {
  return (
    <View
      style={{
        width: Spaces[horizontalSpace],
        height: Spaces[verticalSpace],
      }}
    />
  );
}
