/**
 * Core types for coeli-dnd nested drag-and-drop
 */

export type ItemType = 'ITEM' | 'GROUP';

/**
 * Base item structure that can be either a simple item or a group
 */
export interface DndItem {
  id: string | number;
  label: string;
  type: ItemType;
  children?: DndItem[]; // For groups containing nested items
  parentId?: string | number | null; // Track parent relationship
  [key: string]: any; // Allow additional custom properties
}

/**
 * Position information for an item in the hierarchy
 */
export interface ItemPosition {
  itemId: string | number;
  index: number;
  parentId: string | number | null; // null means root level
  level: number; // 0 for root, 1 for first nesting, etc.
}

/**
 * Drag operation types
 */
export enum DragOperation {
  REORDER_GROUPS = 'REORDER_GROUPS', // Moving groups around canvas
  REORDER_MIXED = 'REORDER_MIXED', // Moving items/groups in mixed array
  ITEM_TO_GROUP = 'ITEM_TO_GROUP', // Moving item from 1st to 2nd level
  ITEM_FROM_GROUP = 'ITEM_FROM_GROUP', // Moving item from 2nd to 1st level
  REORDER_IN_GROUP = 'REORDER_IN_GROUP', // Moving items within a group
  ITEM_BETWEEN_GROUPS = 'ITEM_BETWEEN_GROUPS', // Moving item from one group to another
}

/**
 * Drag event data
 */
export interface DragEvent {
  operation: DragOperation;
  activeItem: DndItem;
  overItem: DndItem | null;
  activePosition: ItemPosition;
  overPosition: ItemPosition | null;
}

/**
 * Drop validation result
 */
export interface DropValidation {
  isValid: boolean;
  reason?: string;
  suggestedOperation?: DragOperation;
}

/**
 * Configuration options
 */
export interface CoeliDndConfig {
  // Maximum nesting depth (default: 2 for your use case)
  maxDepth?: number;

  // Can items be dropped into groups?
  allowItemsInGroups?: boolean;

  // Can groups be nested in other groups?
  allowNestedGroups?: boolean;

  // Can groups be reordered at root level?
  allowGroupReordering?: boolean;

  // Custom validation function
  validateDrop?: (event: DragEvent) => DropValidation;

  // Callbacks
  onDragStart?: (item: DndItem, position: ItemPosition) => void;
  onDragEnd?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent, newItems: DndItem[]) => void;
}

/**
 * Sensor configuration for detecting drag operations
 */
export interface SensorConfig {
  activationConstraint?: {
    distance?: number; // Minimum distance before drag starts
    delay?: number; // Minimum time before drag starts
    tolerance?: number;
  };
}
