/**
 * Main hook for managing nested drag-and-drop
 */

import { useState, useCallback, useRef } from 'react';
import {
  DndItem,
  ItemPosition,
  DragEvent,
  CoeliDndConfig,
  DragOperation
} from '../types';
import {
  findItem,
  determineDragOperation,
  moveItem,
  canDrop as canDropUtil
} from '../utils/hierarchy';

export interface UseCoeliDndReturn {
  items: DndItem[];
  activeItem: DndItem | null;
  activePosition: ItemPosition | null;
  overItem: DndItem | null;
  overPosition: ItemPosition | null;
  currentOperation: DragOperation | null;
  handleDragStart: (itemId: string | number) => void;
  handleDragOver: (itemId: string | number) => void;
  handleDragEnd: () => void;
  setItems: (items: DndItem[]) => void;
  canDrop: (overItemId: string | number) => boolean;
}

const defaultConfig: Required<Omit<CoeliDndConfig, 'onDragStart' | 'onDragEnd' | 'onDrop' | 'validateDrop'>> = {
  maxDepth: 2,
  allowItemsInGroups: true,
  allowNestedGroups: false,
  allowGroupReordering: true,
};

export function useCoeliDnd(
  initialItems: DndItem[],
  config: CoeliDndConfig = {}
): UseCoeliDndReturn {
  const [items, setItemsState] = useState<DndItem[]>(initialItems);
  const [activeItem, setActiveItem] = useState<DndItem | null>(null);
  const [activePosition, setActivePosition] = useState<ItemPosition | null>(null);
  const [overItem, setOverItem] = useState<DndItem | null>(null);
  const [overPosition, setOverPosition] = useState<ItemPosition | null>(null);
  const [currentOperation, setCurrentOperation] = useState<DragOperation | null>(null);

  const configRef = useRef({ ...defaultConfig, ...config });

  const setItems = useCallback((newItems: DndItem[]) => {
    setItemsState(newItems);
  }, []);

  const handleDragStart = useCallback((itemId: string | number) => {
    const found = findItem(items, itemId);

    if (!found) return;

    setActiveItem(found.item);
    setActivePosition(found.position);

    configRef.current.onDragStart?.(found.item, found.position);
  }, [items]);

  const handleDragOver = useCallback((itemId: string | number) => {
    if (!activeItem || !activePosition) return;

    const found = findItem(items, itemId);

    if (!found) {
      setOverItem(null);
      setOverPosition(null);
      setCurrentOperation(null);
      return;
    }

    setOverItem(found.item);
    setOverPosition(found.position);

    // Determine operation type
    const operation = determineDragOperation(
      activePosition,
      found.position,
      activeItem,
      found.item
    );
    setCurrentOperation(operation);
  }, [activeItem, activePosition, items]);

  const canDropCheck = useCallback((overItemId: string | number): boolean => {
    if (!activeItem || !activePosition) return false;

    const found = findItem(items, overItemId);
    if (!found) return false;

    const basicCheck = canDropUtil(
      activeItem,
      activePosition,
      found.item,
      found.position,
      configRef.current.maxDepth,
      configRef.current.allowNestedGroups
    );

    if (!basicCheck) return false;

    // Custom validation
    if (configRef.current.validateDrop) {
      const dragEvent: DragEvent = {
        operation: determineDragOperation(activePosition, found.position, activeItem, found.item),
        activeItem,
        overItem: found.item,
        activePosition,
        overPosition: found.position,
      };

      const validation = configRef.current.validateDrop(dragEvent);
      return validation.isValid;
    }

    return true;
  }, [activeItem, activePosition, items]);

  const handleDragEnd = useCallback(() => {
    if (!activeItem || !activePosition || !overItem || !overPosition) {
      // Reset state
      setActiveItem(null);
      setActivePosition(null);
      setOverItem(null);
      setOverPosition(null);
      setCurrentOperation(null);
      return;
    }

    // Check if drop is valid
    if (!canDropCheck(overItem.id)) {
      setActiveItem(null);
      setActivePosition(null);
      setOverItem(null);
      setOverPosition(null);
      setCurrentOperation(null);
      return;
    }

    const operation = determineDragOperation(
      activePosition,
      overPosition,
      activeItem,
      overItem
    );

    const dragEvent: DragEvent = {
      operation,
      activeItem,
      overItem,
      activePosition,
      overPosition,
    };

    // Calculate new position based on operation
    let targetIndex = overPosition.index;
    let targetParentId = overPosition.parentId;

    // If dropping into a group, place at the end of the group
    if (operation === DragOperation.ITEM_TO_GROUP && overItem.type === 'GROUP') {
      targetParentId = overItem.id;
      targetIndex = overItem.children?.length || 0;
    }

    // Move the item
    const newItems = moveItem(items, activeItem.id, targetParentId, targetIndex);

    setItemsState(newItems);

    // Call callbacks
    configRef.current.onDragEnd?.(dragEvent);
    configRef.current.onDrop?.(dragEvent, newItems);

    // Reset state
    setActiveItem(null);
    setActivePosition(null);
    setOverItem(null);
    setOverPosition(null);
    setCurrentOperation(null);
  }, [activeItem, activePosition, overItem, overPosition, items, canDropCheck]);

  return {
    items,
    activeItem,
    activePosition,
    overItem,
    overPosition,
    currentOperation,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    setItems,
    canDrop: canDropCheck,
  };
}
