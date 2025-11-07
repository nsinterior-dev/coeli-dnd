import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { CoeliDndProvider, useCoeliDndContext, DraggableDroppable, DndItem } from '../index';

function DraggableDroppableExample() {
  const { items } = useCoeliDndContext();

  return (
    <div style={{ padding: 20 }}>
      <p style={{ marginTop: 0, color: '#6b7280' }}>
        These items are both draggable AND droppable. Drag and drop to reorder them!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
        {items.map(item => (
          <DraggableDroppable
            key={item.id}
            item={item}
            activeClassName="active-drop"
            invalidClassName="invalid-drop"
          >
            <div
              style={{
                padding: 16,
                backgroundColor: item.type === 'GROUP' ? '#dbeafe' : '#f3f4f6',
                border: '2px solid',
                borderColor: item.type === 'GROUP' ? '#3b82f6' : '#6b7280',
                borderRadius: 8,
                cursor: 'grab',
                fontWeight: item.type === 'GROUP' ? 'bold' : 'normal',
              }}
            >
              {item.type === 'GROUP' ? '📁' : '📄'} {item.label}
            </div>
          </DraggableDroppable>
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

const meta: Meta<typeof DraggableDroppableExample> = {
  title: 'Components/DraggableDroppable',
  component: DraggableDroppable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DraggableDroppableExample>;

export const SimpleList: Story = {
  render: () => <DraggableDroppableExample />,
  decorators: [
    (Story) => (
      <CoeliDndProvider
        initialItems={[
          { id: '1', label: 'Item 1', type: 'ITEM' },
          { id: '2', label: 'Item 2', type: 'ITEM' },
          { id: '3', label: 'Item 3', type: 'ITEM' },
          { id: '4', label: 'Item 4', type: 'ITEM' },
        ]}
      >
        <Story />
      </CoeliDndProvider>
    ),
  ],
};

export const MixedItemsAndGroups: Story = {
  render: () => <DraggableDroppableExample />,
  decorators: [
    (Story) => (
      <CoeliDndProvider
        initialItems={[
          { id: '1', label: 'Item 1', type: 'ITEM' },
          { id: '2', label: 'Group 1', type: 'GROUP', children: [] },
          { id: '3', label: 'Item 2', type: 'ITEM' },
          { id: '4', label: 'Group 2', type: 'GROUP', children: [] },
          { id: '5', label: 'Item 3', type: 'ITEM' },
        ]}
      >
        <Story />
      </CoeliDndProvider>
    ),
  ],
};

export const Kanban: Story = {
  render: () => {
    function KanbanBoard() {
      const { items } = useCoeliDndContext();

      return (
        <div style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Kanban Board Example</h3>
          <div style={{ display: 'flex', gap: 16 }}>
            {items.map(column => (
              <DraggableDroppableColumn key={column.id} column={column} />
            ))}
          </div>
        </div>
      );
    }

    function DraggableDroppableColumn({ column }: { column: DndItem }) {
      return (
        <div style={{ flex: 1, minWidth: 250 }}>
          <DraggableDroppable
            item={column}
            activeClassName="active-drop"
            invalidClassName="invalid-drop"
          >
            <div
              style={{
                backgroundColor: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
              }}
            >
              <h4 style={{ margin: 0, marginBottom: 12 }}>{column.label}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {column.children?.map(task => (
                  <div
                    key={task.id}
                    style={{
                      padding: 12,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      fontSize: '14px',
                    }}
                  >
                    {task.label}
                  </div>
                ))}
              </div>
            </div>
          </DraggableDroppable>

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

    return <KanbanBoard />;
  },
  decorators: [
    (Story) => (
      <CoeliDndProvider
        initialItems={[
          {
            id: 'todo',
            label: '📋 To Do',
            type: 'GROUP',
            children: [
              { id: 'task-1', label: 'Design new feature', type: 'ITEM' },
              { id: 'task-2', label: 'Write documentation', type: 'ITEM' },
            ],
          },
          {
            id: 'in-progress',
            label: '⚙️ In Progress',
            type: 'GROUP',
            children: [
              { id: 'task-3', label: 'Implement drag and drop', type: 'ITEM' },
            ],
          },
          {
            id: 'done',
            label: '✅ Done',
            type: 'GROUP',
            children: [
              { id: 'task-4', label: 'Setup project', type: 'ITEM' },
              { id: 'task-5', label: 'Create components', type: 'ITEM' },
            ],
          },
        ]}
      >
        <Story />
      </CoeliDndProvider>
    ),
  ],
};
