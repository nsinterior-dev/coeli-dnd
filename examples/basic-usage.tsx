/**
 * Basic usage example of coeli-dnd
 * Demonstrates all 6 drag-and-drop scenarios
 */

import React from 'react';
import {
  CoeliDndProvider,
  useCoeliDndContext,
  DraggableDroppable,
  DndItem,
  DragOperation,
} from '../src';

// Sample data structure
const initialItems: DndItem[] = [
  { id: '1', label: 'Item 1', type: 'ITEM' },
  {
    id: '2',
    label: 'Group 1',
    type: 'GROUP',
    children: [
      { id: '3', label: 'Item 2 (in Group 1)', type: 'ITEM', parentId: '2' },
      { id: '4', label: 'Item 3 (in Group 1)', type: 'ITEM', parentId: '2' },
    ],
  },
  { id: '5', label: 'Item 4', type: 'ITEM' },
  {
    id: '6',
    label: 'Group 2',
    type: 'GROUP',
    children: [
      { id: '7', label: 'Item 5 (in Group 2)', type: 'ITEM', parentId: '6' },
    ],
  },
];

// Canvas component that renders items and groups
function Canvas() {
  const { items, currentOperation } = useCoeliDndContext();

  const renderItem = (item: DndItem, level: number = 0) => {
    const isGroup = item.type === 'GROUP';

    return (
      <div
        key={item.id}
        style={{
          marginLeft: level * 20,
          marginBottom: 8,
        }}
      >
        <DraggableDroppable
          item={item}
          className={isGroup ? 'group' : 'item'}
          activeClassName="drag-over"
          invalidClassName="invalid-drop"
          style={{
            padding: 12,
            border: '2px solid',
            borderColor: isGroup ? '#3b82f6' : '#6b7280',
            borderRadius: 8,
            backgroundColor: isGroup ? '#dbeafe' : '#f3f4f6',
            cursor: 'grab',
          }}
        >
          <div style={{ fontWeight: isGroup ? 'bold' : 'normal' }}>
            {item.label}
          </div>

          {/* Render children if this is a group */}
          {isGroup && item.children && item.children.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {item.children.map(child => renderItem(child, level + 1))}
            </div>
          )}
        </DraggableDroppable>
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Nested Drag & Drop Example</h2>

      {/* Show current operation */}
      {currentOperation && (
        <div
          style={{
            padding: 8,
            marginBottom: 16,
            backgroundColor: '#fef3c7',
            borderRadius: 4,
          }}
        >
          Current operation: <strong>{currentOperation}</strong>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {items.map(item => renderItem(item))}
      </div>

      {/* Instructions */}
      <div style={{ marginTop: 32, padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
        <h3>Supported Operations:</h3>
        <ol>
          <li><strong>Reorder groups:</strong> Drag a group and drop on another group</li>
          <li><strong>Reorder mixed items:</strong> Drag items/groups in the canvas</li>
          <li><strong>Item to group:</strong> Drag a root-level item and drop on a group to add it inside</li>
          <li><strong>Item from group:</strong> Drag an item from inside a group and drop on a root-level item</li>
          <li><strong>Reorder in group:</strong> Drag items within the same group</li>
          <li><strong>Item between groups:</strong> Drag an item from one group and drop in another group</li>
        </ol>
      </div>
    </div>
  );
}

// Main App component
export default function App() {
  return (
    <CoeliDndProvider
      initialItems={initialItems}
      config={{
        maxDepth: 2,
        allowItemsInGroups: true,
        allowNestedGroups: false,
        allowGroupReordering: true,
        onDrop: (event, newItems) => {
          console.log('Drop completed:', event.operation);
          console.log('New items:', newItems);
        },
      }}
    >
      <Canvas />
    </CoeliDndProvider>
  );
}
