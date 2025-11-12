/**
 * Main hook for managing nested drag-and-drop with @dnd-kit
 */

import { useState, useCallback, useRef } from 'react';
import {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  closestCenter,
  CollisionDetection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  DndItem,
  ItemPosition,
  DragEvent,
  CoeliDndConfig,
  DragOperation,
} from '../types';
import {
  findItem,
  determineDragOperation,
  moveItem,
  canDrop as canDropUtil,
} from '../utils/hierarchy';

export interface UseCoeliDndReturn {
  items: DndItem[];
  activeItem: DndItem | null;
  activePosition: ItemPosition | null;
  overItem: DndItem | null;
  overPosition: ItemPosition | null;
  currentOperation: DragOperation | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
  setItems: (items: DndItem[]) => void;
  canDrop: (overItemId: string | number) => boolean;
  sensors: ReturnType<typeof useSensors>;
  collisionDetection: CollisionDetection;
}

const defaultConfig: Required<
  Omit<CoeliDndConfig, 'onDragStart' | 'onDragEnd' | 'onDrop' | 'validateDrop'>
> = {
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
  const lastOverIdRef = useRef<string | number | null>(null);

  // Set up dnd-kit sensors with better activation constraints
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // 10px of movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay before drag starts on touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const setItems = useCallback((newItems: DndItem[]) => {
    setItemsState(newItems);
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const itemId = event.active.id;
      const found = findItem(items, itemId);

      if (!found) return;

      setActiveItem(found.item);
      setActivePosition(found.position);
      lastOverIdRef.current = null;

      configRef.current.onDragStart?.(found.item, found.position);
    },
    [items]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (!activeItem || !activePosition) return;

      const overItemId = event.over?.id;
      if (!overItemId) {
        setOverItem(null);
        setOverPosition(null);
        setCurrentOperation(null);
        return;
      }

      // Avoid unnecessary re-renders
      if (lastOverIdRef.current === overItemId) return;
      lastOverIdRef.current = overItemId;

      const found = findItem(items, overItemId);

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
    },
    [activeItem, activePosition, items]
  );

  const canDropCheck = useCallback(
    (overItemId: string | number): boolean => {
      if (!activeItem || !activePosition) return false;

      const found = findItem(items, overItemId);
      if (!found) return false;

      const operation = determineDragOperation(
        activePosition,
        found.position,
        activeItem,
        found.item
      );

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
          operation,
          activeItem,
          overItem: found.item,
          activePosition,
          overPosition: found.position,
        };

        const validation = configRef.current.validateDrop(dragEvent);
        return validation.isValid;
      }

      return true;
    },
    [activeItem, activePosition, items]
  );

  const resetState = useCallback(() => {
    setActiveItem(null);
    setActivePosition(null);
    setOverItem(null);
    setOverPosition(null);
    setCurrentOperation(null);
    lastOverIdRef.current = null;
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over } = event;

      if (!activeItem || !activePosition) {
        resetState();
        return;
      }

      if (!over) {
        // Dropped outside valid drop zone
        resetState();
        return;
      }

      const found = findItem(items, over.id);
      if (!found) {
        resetState();
        return;
      }

      const foundOverItem = found.item;
      const foundOverPosition = found.position;

      // Check if dropping on itself
      if (activeItem.id === foundOverItem.id) {
        resetState();
        return;
      }

      // Check if drop is valid
      if (!canDropCheck(foundOverItem.id)) {
        resetState();
        return;
      }

      const operation = determineDragOperation(
        activePosition,
        foundOverPosition,
        activeItem,
        foundOverItem
      );

      const dragEvent: DragEvent = {
        operation,
        activeItem,
        overItem: foundOverItem,
        activePosition,
        overPosition: foundOverPosition,
      };

      // Calculate new position based on operation
      let targetIndex = foundOverPosition.index;
      let targetParentId = foundOverPosition.parentId;

      // Determine if we're in the same container
      const sameContainer = activePosition.parentId === foundOverPosition.parentId;

      // If dropping into a group (on the group itself, not its children)
      if (operation === DragOperation.ITEM_TO_GROUP && foundOverItem.type === 'GROUP') {
        targetParentId = foundOverItem.id;
        targetIndex = foundOverItem.children?.length || 0;
      }
      // If dropping before/after an item in the same container
      else if (sameContainer) {
        // If dragging down (positive Y delta), insert after
        // If dragging up (negative Y delta), insert before
        if (activePosition.index < targetIndex) {
          // Dragging down: item will be removed first, so decrease target index
          targetIndex = Math.max(0, targetIndex);
        } else {
          // Dragging up: insert before target
          targetIndex = targetIndex;
        }
      }
      // Different containers - insert after the target by default
      else {
        targetIndex = targetIndex + 1;
      }

      // Move the item
      const newItems = moveItem(items, activeItem.id, targetParentId, targetIndex);

      setItemsState(newItems);

      // Call callbacks
      configRef.current.onDragEnd?.(dragEvent);
      configRef.current.onDrop?.(dragEvent, newItems);

      // Reset state
      resetState();
    },
    [activeItem, activePosition, items, canDropCheck, resetState]
  );

  const handleDragCancel = useCallback(() => {
    resetState();
  }, [resetState]);

  // Custom collision detection for nested items
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      if (!activeItem) {
        return closestCenter(args);
      }

      // Start with pointer-based detection for better accuracy
      const pointerCollisions = pointerWithin(args);

      if (pointerCollisions.length > 0) {
        // If we have pointer collisions, use closestCenter on those candidates
        const centerCollisions = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container =>
            pointerCollisions.some(collision => collision.id === container.id)
          ),
        });

        if (centerCollisions.length > 0) {
          return centerCollisions;
        }

        return pointerCollisions;
      }

      // Fall back to rectangle intersection
      const rectCollisions = rectIntersection(args);

      if (rectCollisions.length > 0) {
        // Prefer items at the same level as the active item
        const activeLevel = activePosition?.level ?? 0;
        const sameLevelCollisions = rectCollisions.filter(collision => {
          const found = findItem(items, collision.id);
          return found && found.position.level === activeLevel;
        });

        if (sameLevelCollisions.length > 0) {
          return closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(container =>
              sameLevelCollisions.some(collision => collision.id === container.id)
            ),
          });
        }

        // Use closestCenter on all rectangle intersections
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container =>
            rectCollisions.some(collision => collision.id === container.id)
          ),
        });
      }

      // Final fallback to closestCenter on all droppable containers
      return closestCenter(args);
    },
    [activeItem, activePosition, items]
  );

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
    handleDragCancel,
    setItems,
    canDrop: canDropCheck,
    sensors,
    collisionDetection,
  };
}
