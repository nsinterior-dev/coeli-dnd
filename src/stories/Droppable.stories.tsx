import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  CoeliDndProvider,
  useCoeliDndContext,
  Draggable,
  Droppable,
  DndItem,
} from '../index';

function DroppableExample() {
  const { items } = useCoeliDndContext();

  const draggableItem: DndItem = items[0] || {
    id: 'drag-1',
    label: 'Draggable Item',
    type: 'ITEM',
  };

  const droppableItem: DndItem = items[1] || {
    id: 'drop-1',
    label: 'Drop Zone',
    type: 'GROUP',
    children: [],
  };

  return (
    <div style={{ display: 'flex', gap: 24, padding: 20 }}>
      <div>
        <h4 style={{ marginTop: 0 }}>Draggable Item</h4>
        <Draggable item={draggableItem}>
          <div
            style={{
              padding: 16,
              backgroundColor: '#f3f4f6',
              border: '2px solid #6b7280',
              borderRadius: 8,
              cursor: 'grab',
              width: 200,
            }}
          >
            📄 {draggableItem.label}
          </div>
        </Draggable>
      </div>

      <div>
        <h4 style={{ marginTop: 0 }}>Drop Zone</h4>
        <Droppable
          item={droppableItem}
          activeClassName="active-drop"
          invalidClassName="invalid-drop"
        >
          <div
            style={{
              padding: 32,
              backgroundColor: '#dbeafe',
              border: '2px dashed #3b82f6',
              borderRadius: 8,
              width: 200,
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            📁 Drop items here
          </div>
        </Droppable>
      </div>

      <style>
        {`
          .active-drop {
            background-color: #d1fae5 !important;
            border-color: #10b981 !important;
          }

          .invalid-drop {
            background-color: #fee2e2 !important;
            border-color: #ef4444 !important;
          }
        `}
      </style>
    </div>
  );
}

const meta: Meta<typeof DroppableExample> = {
  title: 'Components/Droppable',
  component: Droppable,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <CoeliDndProvider
        initialItems={[
          { id: 'drag-1', label: 'Draggable Item', type: 'ITEM' },
          { id: 'drop-1', label: 'Drop Zone', type: 'GROUP', children: [] },
        ]}
      >
        <Story />
      </CoeliDndProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const Default: Story = {
  render: () => <DroppableExample />,
};

export const MultipleDropZones: Story = {
  render: () => {
    function MultipleDropExample() {
      const { items } = useCoeliDndContext();

      return (
        <div style={{ padding: 20 }}>
          <h4 style={{ marginTop: 0 }}>Draggable Items</h4>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {items
              .filter(item => item.type === 'ITEM')
              .map(item => (
                <Draggable key={item.id} item={item}>
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#f3f4f6',
                      border: '2px solid #6b7280',
                      borderRadius: 8,
                      cursor: 'grab',
                    }}
                  >
                    📄 {item.label}
                  </div>
                </Draggable>
              ))}
          </div>

          <h4>Drop Zones</h4>
          <div style={{ display: 'flex', gap: 16 }}>
            {items
              .filter(item => item.type === 'GROUP')
              .map(item => (
                <Droppable
                  key={item.id}
                  item={item}
                  activeClassName="active-drop"
                  invalidClassName="invalid-drop"
                >
                  <div
                    style={{
                      padding: 24,
                      backgroundColor: '#dbeafe',
                      border: '2px dashed #3b82f6',
                      borderRadius: 8,
                      width: 150,
                      minHeight: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}
                  >
                    📁 {item.label}
                  </div>
                </Droppable>
              ))}
          </div>

          <style>
            {`
              .active-drop {
                background-color: #d1fae5 !important;
                border-color: #10b981 !important;
              }

              .invalid-drop {
                background-color: #fee2e2 !important;
                border-color: #ef4444 !important;
              }
            `}
          </style>
        </div>
      );
    }

    return <MultipleDropExample />;
  },
  decorators: [
    (Story) => (
      <CoeliDndProvider
        initialItems={[
          { id: 'item-1', label: 'Item 1', type: 'ITEM' },
          { id: 'item-2', label: 'Item 2', type: 'ITEM' },
          { id: 'item-3', label: 'Item 3', type: 'ITEM' },
          { id: 'group-1', label: 'Zone A', type: 'GROUP', children: [] },
          { id: 'group-2', label: 'Zone B', type: 'GROUP', children: [] },
          { id: 'group-3', label: 'Zone C', type: 'GROUP', children: [] },
        ]}
      >
        <Story />
      </CoeliDndProvider>
    ),
  ],
};
