/**
 * Context provider for coeli-dnd with @dnd-kit integration
 */

import { createContext, useContext, ReactNode } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
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
 * Provider component that manages drag-and-drop state using @dnd-kit
 */
export function CoeliDndProvider({
  children,
  initialItems,
  config,
}: CoeliDndProviderProps) {
  const dndState = useCoeliDnd(initialItems, config);

  return (
    <DndContext
      sensors={dndState.sensors}
      collisionDetection={dndState.collisionDetection}
      onDragStart={dndState.handleDragStart}
      onDragOver={dndState.handleDragOver}
      onDragEnd={dndState.handleDragEnd}
      onDragCancel={dndState.handleDragCancel}
    >
      <CoeliDndContext.Provider value={dndState}>
        {children}

        {/* DragOverlay for smoother drag experience */}
        <DragOverlay>
          {dndState.activeItem ? (
            <div
              style={{
                padding: 12,
                backgroundColor: '#f3f4f6',
                border: '2px solid #6b7280',
                borderRadius: 8,
                opacity: 0.8,
                cursor: 'grabbing',
              }}
            >
              {dndState.activeItem.type === 'GROUP' ? '📁' : '📄'}{' '}
              {dndState.activeItem.label}
            </div>
          ) : null}
        </DragOverlay>
      </CoeliDndContext.Provider>
    </DndContext>
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
