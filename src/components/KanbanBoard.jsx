import { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import Column from './Column';
import Card from './Card';
import CardModal from './CardModal';
import AddColumnModal from './AddColumnModal';
import Button from './ui/Button';

/**
 * Main Kanban Board component
 */
export default function KanbanBoard({ boardId, dataService, onBoardUpdate }) {
  const [board, setBoard] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editingCardColumnId, setEditingCardColumnId] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [addCardToColumnId, setAddCardToColumnId] = useState(null);

  // Load board when boardId changes
  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId]);

  const loadBoard = async () => {
    const loadedBoard = await dataService.getBoard(boardId);
    if (loadedBoard) {
      setBoard(loadedBoard);
    }
  };

  const saveBoard = async (updatedBoard) => {
    await dataService.saveBoard(updatedBoard);
    setBoard(updatedBoard);
    if (onBoardUpdate) {
      onBoardUpdate(updatedBoard);
    }
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveCard(null);
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setBoard((currentBoard) => {
      if (!currentBoard) return currentBoard;
      
      const updatedBoard = { ...currentBoard };
      
      // Find the active card and its column
      let activeColumn = null;
      let activeCardIndex = -1;
      let activeCardData = null;

      for (const column of updatedBoard.columns) {
        const cardIndex = column.cards.findIndex(c => c.id === activeId);
        if (cardIndex !== -1) {
          activeColumn = column;
          activeCardIndex = cardIndex;
          activeCardData = column.cards[cardIndex];
          break;
        }
      }

      if (!activeColumn || !activeCardData) return currentBoard;

      // Find the destination (could be a card or a column)
      let overColumn = null;
      let overCardIndex = -1;

      // Check if over is a column
      const overColumnDirect = updatedBoard.columns.find(c => c.id === overId);
      if (overColumnDirect) {
        overColumn = overColumnDirect;
        overCardIndex = overColumn.cards.length; // Add to end
      } else {
        // Check if over is a card
        for (const column of updatedBoard.columns) {
          const cardIndex = column.cards.findIndex(c => c.id === overId);
          if (cardIndex !== -1) {
            overColumn = column;
            overCardIndex = cardIndex;
            break;
          }
        }
      }

      if (!overColumn) return currentBoard;

      // Remove card from active column
      activeColumn.cards = activeColumn.cards.filter(c => c.id !== activeId);

      // If same column, adjust the sorting
      if (activeColumn.id === overColumn.id) {
        if (activeCardIndex < overCardIndex) {
          overCardIndex--;
        }
        overColumn.cards.splice(overCardIndex, 0, activeCardData);
      } else {
        // Different column - add to new position
        overColumn.cards.splice(overCardIndex, 0, activeCardData);
      }

      // Save the updated board
      saveBoard(updatedBoard);
      
      return updatedBoard;
    });
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeIsCard = active.data.current?.type === 'card';
    const overIsCard = over.data.current?.type === 'card';

    if (!activeIsCard) return;

    // Dragging a card over another card
    if (activeIsCard && overIsCard) {
      setBoard((currentBoard) => {
        if (!currentBoard) return currentBoard;
        
        const updatedBoard = { ...currentBoard };
        
        let activeColumn = null;
        let activeCardIndex = -1;

        for (const column of updatedBoard.columns) {
          const cardIndex = column.cards.findIndex(c => c.id === activeId);
          if (cardIndex !== -1) {
            activeColumn = column;
            activeCardIndex = cardIndex;
            break;
          }
        }

        let overColumn = null;
        let overCardIndex = -1;

        for (const column of updatedBoard.columns) {
          const cardIndex = column.cards.findIndex(c => c.id === overId);
          if (cardIndex !== -1) {
            overColumn = column;
            overCardIndex = cardIndex;
            break;
          }
        }

        if (!activeColumn || !overColumn) return currentBoard;

        if (activeColumn.id === overColumn.id) {
          // Same column - reorder
          activeColumn.cards = arrayMove(
            activeColumn.cards,
            activeCardIndex,
            overCardIndex
          );
        }

        return updatedBoard;
      });
    }
  };

  // Column actions
  const handleAddColumn = () => {
    setEditingColumn(null);
    setIsColumnModalOpen(true);
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
    setIsColumnModalOpen(true);
  };

  const handleSaveColumn = (title) => {
    if (editingColumn) {
      // Edit existing column
      const updatedBoard = { ...board };
      const column = updatedBoard.columns.find(c => c.id === editingColumn.id);
      if (column) {
        column.title = title;
        saveBoard(updatedBoard);
      }
    } else {
      // Add new column
      const newColumn = dataService.createColumn(title);
      const updatedBoard = {
        ...board,
        columns: [...board.columns, newColumn],
      };
      saveBoard(updatedBoard);
    }
  };

  const handleDeleteColumn = (columnId) => {
    const updatedBoard = {
      ...board,
      columns: board.columns.filter(c => c.id !== columnId),
    };
    saveBoard(updatedBoard);
  };

  // Card actions
  const handleAddCard = (columnId) => {
    setAddCardToColumnId(columnId);
    setEditingCard(null);
    setEditingCardColumnId(null);
    setIsCardModalOpen(true);
  };

  const handleEditCard = (card, columnId) => {
    setEditingCard(card);
    setEditingCardColumnId(columnId);
    setAddCardToColumnId(null);
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (cardData) => {
    const updatedBoard = { ...board };
    
    if (editingCard) {
      // Edit existing card
      const column = updatedBoard.columns.find(c => c.id === editingCardColumnId);
      if (column) {
        const cardIndex = column.cards.findIndex(c => c.id === editingCard.id);
        if (cardIndex !== -1) {
          column.cards[cardIndex] = {
            ...column.cards[cardIndex],
            ...cardData,
          };
        }
      }
    } else {
      // Add new card
      const column = updatedBoard.columns.find(c => c.id === addCardToColumnId);
      if (column) {
        const newCard = dataService.createCard(cardData.title, cardData);
        column.cards.push(newCard);
      }
    }
    
    saveBoard(updatedBoard);
  };

  const handleDeleteCard = () => {
    if (!editingCard || !editingCardColumnId) return;
    
    const updatedBoard = { ...board };
    const column = updatedBoard.columns.find(c => c.id === editingCardColumnId);
    if (column) {
      column.cards = column.cards.filter(c => c.id !== editingCard.id);
      saveBoard(updatedBoard);
    }
  };

  if (!board) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Board Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {board.name}
          </h2>
          <Button
            onClick={handleAddColumn}
            variant="primary"
            size="medium"
          >
            <Plus size={16} className="inline mr-1" />
            Add Column
          </Button>
        </div>
      </div>

      {/* Board */}
      <main className="p-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            {board.columns.length === 0 ? (
              <div className="flex items-center justify-center w-full py-20">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No columns yet. Add your first column to get started!
                  </p>
                  <Button
                    onClick={handleAddColumn}
                    variant="primary"
                    size="large"
                  >
                    <Plus size={20} className="inline mr-2" />
                    Add Your First Column
                  </Button>
                </div>
              </div>
            ) : (
              board.columns.map(column => (
                <Column
                  key={column.id}
                  column={column}
                  onAddCard={handleAddCard}
                  onEditCard={handleEditCard}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))
            )}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3 opacity-80">
                <Card card={activeCard} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Modals */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        card={editingCard}
        onSave={handleSaveCard}
        onDelete={editingCard ? handleDeleteCard : null}
      />

      <AddColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        column={editingColumn}
        onSave={handleSaveColumn}
      />
    </div>
  );
}

