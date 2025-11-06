/**
 * Context provider for coeli-dnd
 */

import { createContext, useContext, ReactNode } from 'react';
import { useCoeliDnd, UseCoeliDndReturn } from '../hooks/useCoeliDnd';
import { DndItem, CoeliDndConfig } from '../types';

interface CoeliDndContextValue extends UseCoeliDndReturn {}

const CoeliDndContext = createContext<CoeliDndContextValue | null>(null);

export interface CoeliDndProviderProps {
  children: ReactNode;
  initialItems: DndItem[];
  config?: CoeliDndConfig;
}

/**
 * Provider component that manages drag-and-drop state
 */
export function CoeliDndProvider({ children, initialItems, config }: CoeliDndProviderProps) {
  const dndState = useCoeliDnd(initialItems, config);

  return (
    <CoeliDndContext.Provider value={dndState}>
      {children}
    </CoeliDndContext.Provider>
  );
}

/**
 * Hook to access drag-and-drop context
 */
export function useCoeliDndContext(): CoeliDndContextValue {
  const context = useContext(CoeliDndContext);

  if (!context) {
    throw new Error('useCoeliDndContext must be used within a CoeliDndProvider');
  }

  return context;
}
