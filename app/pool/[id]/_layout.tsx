import { Stack } from 'expo-router';

export default function PoolLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="predict" />
      <Stack.Screen name="match/[matchId]" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
