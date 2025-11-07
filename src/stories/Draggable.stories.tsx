import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { CoeliDndProvider, Draggable, DndItem } from '../index';

const meta: Meta<typeof Draggable> = {
  title: 'Components/Draggable',
  component: Draggable,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <CoeliDndProvider
        initialItems={[
          { id: '1', label: 'Item 1', type: 'ITEM' },
          { id: '2', label: 'Item 2', type: 'ITEM' },
        ]}
      >
        <div style={{ padding: 20 }}>
          <Story />
        </div>
      </CoeliDndProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Draggable>;

const sampleItem: DndItem = {
  id: 'sample-1',
  label: 'Draggable Item',
  type: 'ITEM',
};

export const Default: Story = {
  args: {
    item: sampleItem,
    children: (
      <div
        style={{
          padding: 16,
          backgroundColor: '#f3f4f6',
          border: '2px solid #6b7280',
          borderRadius: 8,
          cursor: 'grab',
        }}
      >
        📄 {sampleItem.label}
      </div>
    ),
  },
};

export const WithCustomStyle: Story = {
  args: {
    item: { id: 'custom-1', label: 'Custom Styled Item', type: 'ITEM' },
    style: {
      padding: 20,
      backgroundColor: '#dbeafe',
      border: '3px dashed #3b82f6',
      borderRadius: 12,
      fontWeight: 'bold',
    },
    children: <div>🎨 Custom Styled Draggable</div>,
  },
};

export const GroupItem: Story = {
  args: {
    item: {
      id: 'group-1',
      label: 'Draggable Group',
      type: 'GROUP',
      children: [
        { id: 'child-1', label: 'Child Item 1', type: 'ITEM' },
        { id: 'child-2', label: 'Child Item 2', type: 'ITEM' },
      ],
    },
    children: (
      <div
        style={{
          padding: 16,
          backgroundColor: '#dbeafe',
          border: '2px solid #3b82f6',
          borderRadius: 8,
          cursor: 'grab',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>📁 Draggable Group</div>
        <div style={{ marginTop: 8, marginLeft: 16, fontSize: '14px' }}>
          <div>📄 Child Item 1</div>
          <div>📄 Child Item 2</div>
        </div>
      </div>
    ),
  },
};

export const WithDragHandle: Story = {
  args: {
    item: { id: 'handle-1', label: 'Item with Handle', type: 'ITEM' },
    dragHandleClassName: 'drag-handle',
    children: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          backgroundColor: '#f3f4f6',
          border: '2px solid #6b7280',
          borderRadius: 8,
        }}
      >
        <div
          className="drag-handle"
          style={{
            cursor: 'grab',
            padding: '4px 8px',
            backgroundColor: '#d1d5db',
            borderRadius: 4,
          }}
        >
          ⋮⋮
        </div>
        <div>📄 Drag using the handle on the left</div>
      </div>
    ),
  },
};
