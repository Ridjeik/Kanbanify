import { useState, useEffect, useRef } from 'react';
import { Plus, ChevronDown, Pencil, Trash2, LayoutDashboard } from 'lucide-react';
import Button from './ui/Button';
import IconButton from './ui/IconButton';

/**
 * Board selector dropdown component
 */
export default function BoardSelector({ 
  boards, 
  currentBoard, 
  onSelectBoard, 
  onCreateBoard, 
  onRenameBoard, 
  onDeleteBoard 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBoard = (board) => {
    onSelectBoard(board);
    setIsOpen(false);
  };

  const handleRename = (e, board) => {
    e.stopPropagation();
    onRenameBoard(board);
    setIsOpen(false);
  };

  const handleDelete = (e, board) => {
    e.stopPropagation();
    if (boards.length <= 1) {
      alert('You must have at least one board!');
      return;
    }
    if (confirm(`Are you sure you want to delete "${board.name}"? This action cannot be undone.`)) {
      onDeleteBoard(board.id);
    }
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    onCreateBoard();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Board Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <LayoutDashboard size={18} className="text-gray-600 dark:text-gray-300" />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {currentBoard ? currentBoard.name : 'Select Board'}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-gray-600 dark:text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Your Boards
              </span>
              <Button
                onClick={handleCreateNew}
                variant="primary"
                size="small"
              >
                <Plus size={14} className="inline mr-1" />
                New Board
              </Button>
            </div>
          </div>

          {/* Board List */}
          <div className="py-2">
            {boards.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                No boards yet. Create your first board!
              </div>
            ) : (
              boards.map((board) => (
                <div
                  key={board.id}
                  className={`flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group ${
                    currentBoard?.id === board.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleSelectBoard(board)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard 
                        size={16} 
                        className={`flex-shrink-0 ${
                          currentBoard?.id === board.id 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      />
                      <span 
                        className={`font-medium truncate ${
                          currentBoard?.id === board.id 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {board.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                      {board.columns?.length || 0} columns
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton
                      icon={Pencil}
                      onClick={(e) => handleRename(e, board)}
                      variant="ghost"
                      size="small"
                      label="Rename board"
                    />
                    {boards.length > 1 && (
                      <IconButton
                        icon={Trash2}
                        onClick={(e) => handleDelete(e, board)}
                        variant="danger"
                        size="small"
                        label="Delete board"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

