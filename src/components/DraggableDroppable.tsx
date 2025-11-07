/**
 * Combined Draggable and Droppable component using @dnd-kit
 */

import { ReactNode, CSSProperties } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useCoeliDndContext } from '../context/CoeliDndContext';
import { DndItem } from '../types';

export interface DraggableDroppableProps {
  item: DndItem;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  dragHandleClassName?: string;
  activeClassName?: string;
  invalidClassName?: string;
}

/**
 * Component that is both draggable and droppable
 * Useful for items that can be dragged and have other items dropped on them
 */
export function DraggableDroppable({
  item,
  children,
  className = '',
  style = {},
  activeClassName = '',
  invalidClassName = '',
}: DraggableDroppableProps) {
  const { canDrop, activeItem } = useCoeliDndContext();

  // Use both draggable and droppable hooks
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
    data: item,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: item.id,
    data: item,
  });

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const isValidDrop = activeItem ? canDrop(item.id) : false;

  let activeClass = '';
  if (isOver && activeItem) {
    activeClass = isValidDrop ? activeClassName : invalidClassName;
  }

  const combinedStyle: CSSProperties = {
    ...style,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`coeli-draggable-droppable ${className} ${activeClass}`}
      style={combinedStyle}
      data-item-id={item.id}
      data-item-type={item.type}
    >
      {children}
    </div>
  );
}
