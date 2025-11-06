/**
 * coeli-dnd - An improved drag-and-drop library for React and Next.js
 * with advanced nested list support
 */

// Types
export type {
  DndItem,
  ItemType,
  ItemPosition,
  DragEvent,
  DropValidation,
  CoeliDndConfig,
  SensorConfig,
} from './types';

export { DragOperation } from './types';

// Context
export { CoeliDndProvider, useCoeliDndContext } from './context/CoeliDndContext';
export type { CoeliDndProviderProps } from './context/CoeliDndContext';

// Hooks
export { useCoeliDnd } from './hooks/useCoeliDnd';
export type { UseCoeliDndReturn } from './hooks/useCoeliDnd';

// Components
export {
  Draggable,
  Droppable,
  DraggableDroppable,
} from './components';

export type {
  DraggableProps,
  DroppableProps,
  DraggableDroppableProps,
} from './components';

// Utilities
export {
  findItem,
  getItemsAtLevel,
  determineDragOperation,
  removeItem,
  insertItem,
  moveItem,
  flattenItems,
  canDrop,
} from './utils/hierarchy';
