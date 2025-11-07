/**
 * Draggable component wrapper
 */

import React, { ReactNode, useRef, CSSProperties } from 'react';
import { useCoeliDndContext } from '../context/CoeliDndContext';
import { DndItem } from '../types';

export interface DraggableProps {
  item: DndItem;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  dragHandleClassName?: string; // Optional drag handle selector
}

/**
 * Makes an item draggable
 */
export function Draggable({ item, children, className = '', style = {}, dragHandleClassName }: DraggableProps) {
  const { activeItem, handleDragStart } = useCoeliDndContext();
  const elementRef = useRef<HTMLDivElement>(null);

  const isDragging = activeItem?.id === item.id;

  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // If drag handle is specified, check if we're dragging from the handle
    if (dragHandleClassName) {
      const target = e.target as HTMLElement;
      const handle = target.closest(`.${dragHandleClassName}`);
      if (!handle) {
        e.preventDefault();
        return;
      }
    }

    handleDragStart(item.id);

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const combinedStyle: CSSProperties = {
    ...style,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={elementRef}
      draggable
      onDragStart={onDragStart}
      className={`coeli-draggable ${className}`}
      style={combinedStyle}
      data-item-id={item.id}
      data-item-type={item.type}
    >
      {children}
    </div>
  );
}
