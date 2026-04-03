import { Stack } from 'expo-router';

export default function PoolLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Detalhes do Grupo' }} />
      <Stack.Screen name="settings" options={{ title: 'Regras de Pontuação' }} />
    </Stack>
  );
}
