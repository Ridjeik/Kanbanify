import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';

// Board presets with different column configurations
const BOARD_PRESETS = [
  {
    id: 'simple',
    name: 'Simple Kanban',
    description: 'Basic 3-column board',
    icon: '📋',
    columns: ['To Do', 'In Progress', 'Done'],
  },
  {
    id: 'development',
    name: 'Development Workflow',
    description: 'Full software development lifecycle',
    icon: '💻',
    columns: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
  },
  {
    id: 'personal',
    name: 'Personal Tasks',
    description: 'Organize your personal to-dos',
    icon: '✅',
    columns: ['To Do', 'Doing', 'Done', 'Archived'],
  },
  {
    id: 'agile',
    name: 'Agile Sprint',
    description: 'Sprint planning and tracking',
    icon: '🏃',
    columns: ['Sprint Backlog', 'In Progress', 'Testing', 'Done'],
  },
  {
    id: 'custom',
    name: 'Start from Scratch',
    description: 'Empty board to customize',
    icon: '🎨',
    columns: [],
  },
];

/**
 * Modal for adding or editing boards
 */
export default function AddBoardModal({ isOpen, onClose, board, onSave }) {
  const [name, setName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  useEffect(() => {
    if (board) {
      setName(board.name || '');
      setSelectedPreset(null);
    } else {
      setName('');
      setSelectedPreset(BOARD_PRESETS[0]); // Default to Simple Kanban
    }
  }, [board, isOpen]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave(name.trim(), selectedPreset);
    onClose();
    setName('');
    setSelectedPreset(BOARD_PRESETS[0]);
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={board ? 'Rename Board' : 'Create New Board'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Board Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My Project, Sprint Planning"
          required
          autoFocus
        />
        
        {/* Only show presets when creating a new board (not renaming) */}
        {!board && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Choose a Template
            </label>
            <div className="grid grid-cols-1 gap-3">
              {BOARD_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      selectedPreset?.id === preset.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{preset.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {preset.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {preset.description}
                      </div>
                      {preset.columns.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {preset.columns.map((col, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="medium"
          >
            {board ? 'Save Changes' : 'Create Board'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

