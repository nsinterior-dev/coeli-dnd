/**
 * Droppable component wrapper
 */

import React, { ReactNode, useState, CSSProperties } from 'react';
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
 * Makes an area droppable
 */
export function Droppable({
  item,
  children,
  className = '',
  style = {},
  activeClassName = '',
  invalidClassName = '',
}: DroppableProps) {
  const { handleDragOver, handleDragEnd, canDrop, activeItem } = useCoeliDndContext();
  const [isOver, setIsOver] = useState(false);

  const isValidDrop = activeItem ? canDrop(item.id) : false;

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
    handleDragOver(item.id);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set isOver to false if we're leaving the droppable entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsOver(false);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragOver(item.id);

    // Visual feedback for drop validity
    e.dataTransfer.dropEffect = isValidDrop ? 'move' : 'none';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);

    if (!isValidDrop) return;

    handleDragEnd();
  };

  let activeClass = '';
  if (isOver && activeItem) {
    activeClass = isValidDrop ? activeClassName : invalidClassName;
  }

  const combinedStyle: CSSProperties = {
    ...style,
  };

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`coeli-droppable ${className} ${activeClass}`}
      style={combinedStyle}
      data-item-id={item.id}
      data-item-type={item.type}
    >
      {children}
    </div>
  );
}
