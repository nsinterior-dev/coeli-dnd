/**
 * Droppable component wrapper using @dnd-kit
 */

import { ReactNode, CSSProperties } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useCoeliDndContext } from '../context/CoeliDndContext';
import { DndItem } from '../types';

export interface DroppableProps {
  item: DndItem;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  activeClassName?: string; // Class when being dragged over
  invalidClassName?: string; // Class when drop is invalid
}

/**
 * Makes an area droppable using @dnd-kit
 */
export function Droppable({
  item,
  children,
  className = '',
  style = {},
  activeClassName = '',
  invalidClassName = '',
}: DroppableProps) {
  const { canDrop, activeItem } = useCoeliDndContext();
  const { setNodeRef, isOver } = useDroppable({
    id: item.id,
    data: item,
  });

  const isValidDrop = activeItem ? canDrop(item.id) : false;

  let activeClass = '';
  if (isOver && activeItem) {
    activeClass = isValidDrop ? activeClassName : invalidClassName;
  }

  const combinedStyle: CSSProperties = {
    ...style,
  };

  return (
    <div
      ref={setNodeRef}
      className={`coeli-droppable ${className} ${activeClass}`}
      style={combinedStyle}
      data-item-id={item.id}
      data-item-type={item.type}
    >
      {children}
    </div>
  );
}
