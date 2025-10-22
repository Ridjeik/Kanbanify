import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';

/**
 * Modal for adding or editing columns
 */
export default function AddColumnModal({ isOpen, onClose, column, onSave }) {
  const [title, setTitle] = useState('');
  
  useEffect(() => {
    if (column) {
      setTitle(column.title || '');
    } else {
      setTitle('');
    }
  }, [column, isOpen]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave(title.trim());
    onClose();
    setTitle('');
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={column ? 'Edit Column' : 'New Column'}
      size="small"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Column Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., To Do, In Progress, Done"
          required
          autoFocus
        />
        
        <div className="flex justify-end gap-2 pt-4">
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
            {column ? 'Save Changes' : 'Create Column'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

