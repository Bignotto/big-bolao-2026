import AppAvatar from '@/components/AppComponents/AppAvatar';
import AppButton from '@/components/AppComponents/AppButton';
import AppContainer from '@/components/AppComponents/AppContainer';
import AppInput from '@/components/AppComponents/AppInput';
import AppNumberInput from '@/components/AppComponents/AppNumberInput';
import AppPasswordInput from '@/components/AppComponents/AppPasswordInput';
import AppSpacer from '@/components/AppComponents/AppSpacer';
import AppStarsScore from '@/components/AppComponents/AppStarsScore';
import AppText from '@/components/AppComponents/AppText';
import { ScrollView } from 'react-native';
import { useTheme } from 'styled-components/native';

export default function ComponentsScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 24, gap: 32 }}
    >
      {/* AppText */}
      <Section title="AppText">
        <AppText size="xlg" bold>xlg bold</AppText>
        <AppText size="lg">lg regular</AppText>
        <AppText size="md">md regular</AppText>
        <AppText size="sm" color={theme.colors.text_gray}>sm gray</AppText>
        <AppText size="xsm" color={theme.colors.primary}>xsm primary</AppText>
      </Section>

      {/* AppSpacer */}
      <Section title="AppSpacer">
        <AppText size="sm">Below is a vertical spacer (lg)</AppText>
        <AppSpacer verticalSpace="lg" />
        <AppText size="sm">End of spacer</AppText>
      </Section>

      {/* AppButton variants */}
      <Section title="AppButton — variants">
        <AppButton title="Solid (default)" variant="solid" />
        <AppButton title="Primary" variant="positive" />
        <AppButton title="Negative" variant="negative" />
        <AppButton title="Transparent" variant="transparent" />
        <AppButton title="Outline" variant="solid" outline />
        <AppButton title="Disabled" variant="solid" disabled />
        <AppButton title="Loading" variant="positive" isLoading />
      </Section>

      {/* AppButton sizes */}
      <Section title="AppButton — sizes">
        <AppButton title="Large" size="lg" />
        <AppButton title="Medium" size="md" />
        <AppButton title="Small" size="sm" />
      </Section>

      {/* AppInput */}
      <Section title="AppInput">
        <AppInput label="Name" placeholder="Enter your name" />
        <AppInput label="With error" placeholder="Email" error="Invalid email address" />
      </Section>

      {/* AppNumberInput */}
      <Section title="AppNumberInput">
        <AppNumberInput label="Price" currency="R$" placeholder="0,00" />
        <AppNumberInput label="Distance" unit="km" placeholder="0" />
      </Section>

      {/* AppPasswordInput */}
      <Section title="AppPasswordInput">
        <AppPasswordInput label="Password" placeholder="Enter your password" />
        <AppPasswordInput label="Error state" placeholder="Password" error="Too short" />
      </Section>

      {/* AppAvatar */}
      <Section title="AppAvatar">
        <AppContainer direction="row" justify="space-evenly">
          <AppAvatar size={32} imagePath="https://avatars.githubusercontent.com/u/2911353" />
          <AppAvatar size={56} imagePath="https://avatars.githubusercontent.com/u/2911353" />
          <AppAvatar size={80} imagePath="https://avatars.githubusercontent.com/u/2911353" />
        </AppContainer>
      </Section>

      {/* AppStarsScore */}
      <Section title="AppStarsScore">
        <AppStarsScore scoreTotal={4} reviewCount={1} format="stars" size="md" />
        <AppStarsScore scoreTotal={35} reviewCount={10} format="stars" size="sm" />
        <AppStarsScore scoreTotal={35} reviewCount={10} format="numbers" size="md" />
      </Section>

      <AppSpacer verticalSpace="xlg" />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <AppContainer align="flex-start" padding={0}>
      <AppText bold size="sm" color={theme.colors.primary}>
        {title.toUpperCase()}
      </AppText>
      <AppSpacer verticalSpace="sm" />
      {children}
    </AppContainer>
  );
}
