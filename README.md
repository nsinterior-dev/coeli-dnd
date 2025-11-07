# coeli-dnd

An improved drag-and-drop library for React and Next.js with advanced nested list support. Built to solve complex nested drag-and-drop scenarios that are challenging with existing libraries.

## Features

- **Nested Drag & Drop**: Seamlessly handle items and groups in the same array
- **6 Core Operations**:
  1. Reorder groups around the canvas
  2. Move items around the canvas with multiple groups
  3. Move items from 1st level to 2nd level (into groups)
  4. Move items from 2nd level to 1st level (out of groups)
  5. Move items inside a group
  6. Move items from one group to another
- **Type-safe**: Written in TypeScript with full type definitions
- **Flexible**: Works with React and Next.js
- **Customizable**: Extensive configuration options and callbacks
- **Lightweight**: No dependencies on other DnD libraries

## Installation

```bash
npm install coeli-dnd
# or
yarn add coeli-dnd
# or
pnpm add coeli-dnd
```

## Quick Start

```tsx
import React from 'react';
import {
  CoeliDndProvider,
  useCoeliDndContext,
  DraggableDroppable,
  DndItem,
} from 'coeli-dnd';

const items: DndItem[] = [
  { id: '1', label: 'Item 1', type: 'ITEM' },
  {
    id: '2',
    label: 'Group 1',
    type: 'GROUP',
    children: [
      { id: '3', label: 'Item 2', type: 'ITEM', parentId: '2' },
    ],
  },
];

function Canvas() {
  const { items } = useCoeliDndContext();

  return (
    <div>
      {items.map(item => (
        <DraggableDroppable key={item.id} item={item}>
          <div>{item.label}</div>
        </DraggableDroppable>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <CoeliDndProvider initialItems={items}>
      <Canvas />
    </CoeliDndProvider>
  );
}
```

## Data Structure

Items and groups share the same structure:

```typescript
interface DndItem {
  id: string | number;
  label: string;
  type: 'ITEM' | 'GROUP';
  children?: DndItem[]; // For groups containing nested items
  parentId?: string | number | null; // Track parent relationship
  [key: string]: any; // Additional custom properties
}
```

## API Reference

### `CoeliDndProvider`

The main provider component that manages drag-and-drop state.

```tsx
<CoeliDndProvider
  initialItems={items}
  config={{
    maxDepth: 2,
    allowItemsInGroups: true,
    allowNestedGroups: false,
    allowGroupReordering: true,
    onDrop: (event, newItems) => {
      console.log('Items updated:', newItems);
    },
  }}
>
  {children}
</CoeliDndProvider>
```

**Props:**
- `initialItems`: Initial array of DndItem objects
- `config`: Configuration object (optional)
  - `maxDepth`: Maximum nesting depth (default: 2)
  - `allowItemsInGroups`: Can items be dropped into groups? (default: true)
  - `allowNestedGroups`: Can groups be nested in other groups? (default: false)
  - `allowGroupReordering`: Can groups be reordered at root level? (default: true)
  - `validateDrop`: Custom validation function
  - `onDragStart`: Callback when drag starts
  - `onDragEnd`: Callback when drag ends
  - `onDrop`: Callback when drop occurs with new items array

### `useCoeliDndContext`

Hook to access drag-and-drop state and methods.

```tsx
const {
  items,              // Current items array
  activeItem,         // Currently dragged item
  activePosition,     // Position of active item
  overItem,           // Item being hovered over
  overPosition,       // Position of over item
  currentOperation,   // Current drag operation type
  handleDragStart,    // Start drag function
  handleDragOver,     // Drag over function
  handleDragEnd,      // End drag function
  setItems,           // Update items function
  canDrop,            // Check if drop is valid
} = useCoeliDndContext();
```

### Components

#### `Draggable`

Makes an element draggable.

```tsx
<Draggable item={item} dragHandleClassName="handle">
  <div>Drag me</div>
</Draggable>
```

#### `Droppable`

Makes an element droppable.

```tsx
<Droppable
  item={item}
  activeClassName="drag-over"
  invalidClassName="invalid-drop"
>
  <div>Drop here</div>
</Droppable>
```

#### `DraggableDroppable`

Combines both draggable and droppable functionality.

```tsx
<DraggableDroppable item={item}>
  <div>Drag and drop</div>
</DraggableDroppable>
```

## Drag Operations

The library automatically detects and handles these operations:

- `REORDER_GROUPS`: Moving groups around canvas
- `REORDER_MIXED`: Moving items/groups in mixed array
- `ITEM_TO_GROUP`: Moving item from 1st to 2nd level
- `ITEM_FROM_GROUP`: Moving item from 2nd to 1st level
- `REORDER_IN_GROUP`: Moving items within a group
- `ITEM_BETWEEN_GROUPS`: Moving item between groups

## Advanced Usage

### Custom Validation

```tsx
<CoeliDndProvider
  initialItems={items}
  config={{
    validateDrop: (event) => {
      // Custom validation logic
      if (event.activeItem.type === 'GROUP' && event.overItem?.type === 'ITEM') {
        return { isValid: false, reason: 'Cannot drop group on item' };
      }
      return { isValid: true };
    },
  }}
>
  {children}
</CoeliDndProvider>
```

### Using the Hook Directly

```tsx
import { useCoeliDnd } from 'coeli-dnd';

function MyComponent() {
  const dnd = useCoeliDnd(initialItems, {
    onDrop: (event, newItems) => {
      // Handle drop
    },
  });

  return (
    <div>
      {dnd.items.map(item => (
        <div key={item.id}>{item.label}</div>
      ))}
    </div>
  );
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

## Examples

See the `examples/` directory for complete usage examples.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
