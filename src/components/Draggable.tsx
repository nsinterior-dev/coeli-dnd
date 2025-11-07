/**
 * Draggable component wrapper using @dnd-kit
 */

import { ReactNode, CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { DndItem } from '../types';

export interface DraggableProps {
  item: DndItem;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  dragHandleClassName?: string; // Optional drag handle selector
}

/**
 * Makes an item draggable using @dnd-kit
 */
export function Draggable({
  item,
  children,
  className = '',
  style = {},
}: DraggableProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: item,
  });

  const combinedStyle: CSSProperties = {
    ...style,
    // Hide the original element when dragging (DragOverlay shows the ghost)
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`coeli-draggable ${className}`}
      style={combinedStyle}
      data-item-id={item.id}
      data-item-type={item.type}
    >
      {children}
    </div>
  );
}
