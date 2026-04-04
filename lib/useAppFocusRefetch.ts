import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { focusManager } from '@tanstack/react-query';

export function useAppFocusRefetch(): void {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasBackground =
        appState.current === 'background' || appState.current === 'inactive';
      const isActive = nextState === 'active';

      if (wasBackground && isActive) {
        focusManager.setFocused(true);
      } else if (!isActive) {
        focusManager.setFocused(false);
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);
}
