import { AppContainerProps, Container } from './styles';

export default function AppContainer({ children, ...rest }: AppContainerProps) {
  return <Container {...rest}>{children}</Container>;
}
