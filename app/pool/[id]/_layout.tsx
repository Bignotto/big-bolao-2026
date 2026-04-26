import { Stack } from 'expo-router';

export default function PoolLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Detalhes do Grupo' }} />
      <Stack.Screen name="predict" options={{ title: 'Palpite' }} />
      <Stack.Screen name="match/[matchId]" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: 'Regras de Pontuação' }} />
    </Stack>
  );
}
