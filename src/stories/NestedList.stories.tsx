import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  CoeliDndProvider,
  useCoeliDndContext,
  DraggableDroppable,
  DndItem,
} from '../index';

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
  { id: '8', label: 'Item 6', type: 'ITEM' },
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
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontWeight: isGroup ? 'bold' : 'normal', userSelect: 'none' }}>
            {isGroup ? '📁' : '📄'} {item.label}
          </div>

          {/* Render children if this is a group */}
          {isGroup && item.children && item.children.length > 0 && (
            <div style={{ marginTop: 8, marginLeft: 12 }}>
              {item.children.map(child => renderItem(child, level + 1))}
            </div>
          )}
        </DraggableDroppable>
      </div>
    );
  };

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Nested Drag & Drop Demo</h2>

      {/* Show current operation */}
      {currentOperation && (
        <div
          style={{
            padding: 12,
            marginBottom: 16,
            backgroundColor: '#fef3c7',
            borderRadius: 8,
            fontSize: '14px',
          }}
        >
          <strong>Current operation:</strong> {currentOperation}
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
        }}
      >
        {items.map(item => renderItem(item))}
      </div>

      {/* Instructions */}
      <div
        style={{
          marginTop: 32,
          padding: 20,
          backgroundColor: '#f0f9ff',
          borderRadius: 8,
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Supported Operations:</h3>
        <ol style={{ marginBottom: 0 }}>
          <li>
            <strong>Reorder groups:</strong> Drag a group and drop on another group
          </li>
          <li>
            <strong>Reorder mixed items:</strong> Drag items/groups around the canvas
          </li>
          <li>
            <strong>Item to group:</strong> Drag a root-level item and drop on a group to
            add it inside
          </li>
          <li>
            <strong>Item from group:</strong> Drag an item from inside a group and drop on
            a root-level item
          </li>
          <li>
            <strong>Reorder in group:</strong> Drag items within the same group
          </li>
          <li>
            <strong>Item between groups:</strong> Drag an item from one group and drop in
            another group
          </li>
        </ol>
      </div>

      <style>
        {`
          .drag-over {
            border-color: #10b981 !important;
            background-color: #d1fae5 !important;
          }

          .invalid-drop {
            border-color: #ef4444 !important;
            background-color: #fee2e2 !important;
          }
        `}
      </style>
    </div>
  );
}

// Story wrapper component
function NestedListExample() {
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

const meta: Meta<typeof NestedListExample> = {
  title: 'Examples/Nested List',
  component: NestedListExample,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NestedListExample>;

export const Default: Story = {};
