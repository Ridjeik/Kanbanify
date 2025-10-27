import { useState, useEffect } from 'react';
import { Calendar, Tag as TagIcon, Trash2, Flag } from 'lucide-react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import Tag, { getRandomTagColor } from './Tag';
import Priority, { getPriorityLevels } from './Priority';

/**
 * Modal for viewing and editing card details
 */
export default function CardModal({ isOpen, onClose, card, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    tags: [],
    priority: 'medium',
  });
  const [newTag, setNewTag] = useState('');
  
  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || '',
        description: card.description || '',
        dueDate: card.dueDate || '',
        tags: card.tags || [],
        priority: card.priority || 'medium',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        tags: [],
        priority: 'medium',
      });
    }
  }, [card, isOpen]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSave(formData);
    onClose();
  };
  
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const tagObj = {
      label: newTag.trim(),
      color: getRandomTagColor(),
    };
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tagObj],
    }));
    setNewTag('');
  };
  
  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={card ? 'Edit Card' : 'New Card'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter card title"
          required
          autoFocus
        />
        
        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Add a more detailed description..."
            rows={4}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
              bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 
              text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          />
        </div>
        
        {/* Due Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Calendar size={16} />
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
              bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 
              text-gray-900 dark:text-gray-100"
          />
        </div>
        
        {/* Priority */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Flag size={16} />
            Priority
          </label>
          <div className="flex gap-2">
            {getPriorityLevels().map((priorityLevel) => (
              <button
                key={priorityLevel.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority: priorityLevel.value }))}
                className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all
                  ${formData.priority === priorityLevel.value
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
              >
                <Priority level={priorityLevel.value} showLabel={true} size="small" />
              </button>
            ))}
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <TagIcon size={16} />
            Tags
          </label>
          
          {/* Tag list */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Tag
                  key={index}
                  label={typeof tag === 'string' ? tag : tag.label}
                  color={typeof tag === 'string' ? 'blue' : tag.color}
                  onRemove={() => handleRemoveTag(index)}
                />
              ))}
            </div>
          )}
          
          {/* Add new tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 
                text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <Button
              type="button"
              onClick={handleAddTag}
              variant="secondary"
              size="medium"
            >
              Add
            </Button>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {card && onDelete && (
              <Button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                variant="danger"
                size="medium"
              >
                <Trash2 size={16} className="inline mr-2" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
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
              {card ? 'Save Changes' : 'Create Card'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

