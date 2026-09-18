import { useState, useEffect } from 'react';

export type CursorMode = 'default' | 'hover' | 'view' | 'explore' | 'hidden';

let globalSetMode: ((mode: CursorMode) => void) | null = null;

export function setCursorMode(mode: CursorMode) {
  if (globalSetMode) {
    globalSetMode(mode);
  }
}

export function useCursorMode() {
  const [mode, setMode] = useState<CursorMode>('default');

  useEffect(() => {
    globalSetMode = setMode;
    return () => {
      globalSetMode = null;
    };
  }, []);

  return { mode, setMode };
}
