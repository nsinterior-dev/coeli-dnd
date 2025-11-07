/**
 * Combined Draggable and Droppable component
 */

import { ReactNode, CSSProperties } from 'react';
import { Draggable } from './Draggable';
import { Droppable } from './Droppable';
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
  dragHandleClassName,
  activeClassName = '',
  invalidClassName = '',
}: DraggableDroppableProps) {
  return (
    <Droppable
      item={item}
      className={className}
      style={style}
      activeClassName={activeClassName}
      invalidClassName={invalidClassName}
    >
      <Draggable item={item} dragHandleClassName={dragHandleClassName}>
        {children}
      </Draggable>
    </Droppable>
  );
}
