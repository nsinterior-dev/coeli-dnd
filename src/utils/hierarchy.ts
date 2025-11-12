/**
 * Utility functions for managing nested hierarchy
 */

import { DndItem, ItemPosition, DragOperation } from '../types';

/**
 * Find an item by ID in a nested structure
 */
export function findItem(
  items: DndItem[],
  itemId: string | number,
  parentId: string | number | null = null,
  level: number = 0
): { item: DndItem; position: ItemPosition } | null {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (item.id === itemId) {
      return {
        item,
        position: { itemId, index, parentId, level }
      };
    }

    // Search in children if this is a group
    if (item.type === 'GROUP' && item.children && item.children.length > 0) {
      const found = findItem(item.children, itemId, item.id, level + 1);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Get all items at a specific level
 */
export function getItemsAtLevel(items: DndItem[], targetLevel: number, currentLevel: number = 0): DndItem[] {
  if (currentLevel === targetLevel) {
    return items;
  }

  const result: DndItem[] = [];
  for (const item of items) {
    if (item.type === 'GROUP' && item.children) {
      result.push(...getItemsAtLevel(item.children, targetLevel, currentLevel + 1));
    }
  }

  return result;
}

/**
 * Determine the drag operation type based on active and over positions
 */
export function determineDragOperation(
  activePosition: ItemPosition,
  overPosition: ItemPosition | null,
  activeItem: DndItem,
  overItem: DndItem | null
): DragOperation {
  // No over target
  if (!overPosition || !overItem) {
    return DragOperation.REORDER_MIXED;
  }

  const activeLevel = activePosition.level;
  const overLevel = overPosition.level;
  const activeParent = activePosition.parentId;
  const overParent = overPosition.parentId;

  // Special case: dropping directly on a group (to add item into it)
  if (overItem.type === 'GROUP' && activeItem.type === 'ITEM') {
    // If dropping on a group at the same level, it means we want to put the item INTO the group
    if (activeLevel === overLevel) {
      return DragOperation.ITEM_TO_GROUP;
    }
  }

  // Moving from root to inside a group
  if (activeLevel === 0 && overLevel === 1) {
    return DragOperation.ITEM_TO_GROUP;
  }

  // Moving from inside a group to root
  if (activeLevel === 1 && overLevel === 0) {
    return DragOperation.ITEM_FROM_GROUP;
  }

  // Both at root level
  if (activeLevel === 0 && overLevel === 0) {
    // Check if moving groups
    if (activeItem.type === 'GROUP' || overItem.type === 'GROUP') {
      return DragOperation.REORDER_GROUPS;
    }
    return DragOperation.REORDER_MIXED;
  }

  // Both inside groups
  if (activeLevel === 1 && overLevel === 1) {
    // Same parent - reordering within group
    if (activeParent === overParent) {
      return DragOperation.REORDER_IN_GROUP;
    }
    // Different parents - moving between groups
    return DragOperation.ITEM_BETWEEN_GROUPS;
  }

  return DragOperation.REORDER_MIXED;
}

/**
 * Remove an item from the hierarchy
 */
export function removeItem(items: DndItem[], itemId: string | number): DndItem[] {
  return items
    .filter(item => item.id !== itemId)
    .map(item => {
      if (item.type === 'GROUP' && item.children) {
        return {
          ...item,
          children: removeItem(item.children, itemId)
        };
      }
      return item;
    });
}

/**
 * Insert an item at a specific position
 */
export function insertItem(
  items: DndItem[],
  item: DndItem,
  parentId: string | number | null,
  index: number
): DndItem[] {
  // Insert at root level
  if (parentId === null) {
    const newItems = [...items];
    newItems.splice(index, 0, { ...item, parentId: null });
    return newItems;
  }

  // Insert into a group
  return items.map(currentItem => {
    if (currentItem.id === parentId && currentItem.type === 'GROUP') {
      const children = currentItem.children || [];
      const newChildren = [...children];
      newChildren.splice(index, 0, { ...item, parentId });
      return { ...currentItem, children: newChildren };
    }

    if (currentItem.type === 'GROUP' && currentItem.children) {
      return {
        ...currentItem,
        children: insertItem(currentItem.children, item, parentId, index)
      };
    }

    return currentItem;
  });
}

/**
 * Move an item from one position to another
 */
export function moveItem(
  items: DndItem[],
  itemId: string | number,
  targetParentId: string | number | null,
  targetIndex: number
): DndItem[] {
  const found = findItem(items, itemId);
  if (!found) return items;

  const { item } = found;

  // Remove from old position
  let newItems = removeItem(items, itemId);

  // Insert at new position
  newItems = insertItem(newItems, item, targetParentId, targetIndex);

  return newItems;
}

/**
 * Flatten nested structure for easier manipulation
 */
export function flattenItems(items: DndItem[], level: number = 0, parentId: string | number | null = null): Array<DndItem & { level: number; parentId: string | number | null }> {
  const result: Array<DndItem & { level: number; parentId: string | number | null }> = [];

  for (const item of items) {
    result.push({ ...item, level, parentId });

    if (item.type === 'GROUP' && item.children && item.children.length > 0) {
      result.push(...flattenItems(item.children, level + 1, item.id));
    }
  }

  return result;
}

/**
 * Check if an item can be dropped at a target position
 */
export function canDrop(
  activeItem: DndItem,
  activePosition: ItemPosition,
  overItem: DndItem | null,
  overPosition: ItemPosition | null,
  maxDepth: number = 2,
  allowNestedGroups: boolean = false
): boolean {
  if (!overPosition || !overItem) return true;

  // Prevent dropping on itself
  if (activeItem.id === overItem.id) return false;

  // Prevent dropping a parent into its own child
  if (activeItem.type === 'GROUP' && overPosition.parentId === activeItem.id) {
    return false;
  }

  // If dropping on a group, check if we can add items to groups
  if (overItem.type === 'GROUP' && activeItem.type === 'ITEM') {
    // The target depth would be inside the group (level + 1)
    const targetDepth = overPosition.level + 1;
    if (targetDepth >= maxDepth) return false;
    return true;
  }

  // Check depth constraints for regular positioning
  if (overPosition.level >= maxDepth) return false;

  // Check if nesting groups is allowed
  if (!allowNestedGroups && activeItem.type === 'GROUP') {
    // If dropping ON a group, that would nest the group
    if (overItem.type === 'GROUP' && activePosition.level === overPosition.level) {
      return false;
    }
    // If the target position is inside a group
    if (overPosition.level > 0) {
      return false;
    }
  }

  return true;
}
