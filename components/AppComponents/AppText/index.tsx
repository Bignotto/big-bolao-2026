import { AppTextStyleProps, TextContainer } from './styles';

export default function AppText({ children, ...rest }: AppTextStyleProps) {
  return <TextContainer {...rest}>{children}</TextContainer>;
}
