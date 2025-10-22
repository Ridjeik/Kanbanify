import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Card from './Card';
import Button from './ui/Button';
import IconButton from './ui/IconButton';

/**
 * Column component with droppable area
 */
export default function Column({ 
  column, 
  onAddCard, 
  onEditCard, 
  onEditColumn, 
  onDeleteColumn 
}) {
  const [showMenu, setShowMenu] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });
  
  const cardIds = column.cards.map(card => card.id);
  
  return (
    <div 
      className="flex flex-col bg-gray-100 dark:bg-gray-800 rounded-xl p-4 w-80 flex-shrink-0 h-fit max-h-[calc(100vh-12rem)]"
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {column.title}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {column.cards.length}
          </span>
        </div>
        
        {/* Column menu */}
        <div className="relative">
          <IconButton
            icon={MoreVertical}
            onClick={() => setShowMenu(!showMenu)}
            label="Column options"
            size="small"
          />
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-20 min-w-[150px]">
                <button
                  onClick={() => {
                    onEditColumn(column);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete column "${column.title}"? All cards in this column will be deleted.`)) {
                      onDeleteColumn(column.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Cards area */}
      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto space-y-2 min-h-[100px] rounded-lg p-2 -m-2 transition-colors
          ${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      >
        <SortableContext 
          items={cardIds}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map(card => (
            <Card 
              key={card.id} 
              card={card}
              onClick={() => onEditCard(card, column.id)}
            />
          ))}
        </SortableContext>
        
        {column.cards.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No cards yet
          </div>
        )}
      </div>
      
      {/* Add card button */}
      <Button
        onClick={() => onAddCard(column.id)}
        variant="ghost"
        size="medium"
        className="mt-3 w-full justify-center"
      >
        <Plus size={16} className="inline mr-1" />
        Add Card
      </Button>
    </div>
  );
}

