import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical } from 'lucide-react';
import Tag from './Tag';

/**
 * Draggable Card component
 */
export default function Card({ card, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 
        p-3 cursor-pointer hover:shadow-md transition-shadow group
        ${isDragging ? 'cursor-grabbing' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing 
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </button>
        
        {/* Card content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 break-words">
            {card.title}
          </h3>
          
          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.tags.map((tag, index) => (
                <Tag 
                  key={index} 
                  label={typeof tag === 'string' ? tag : tag.label}
                  color={typeof tag === 'string' ? 'blue' : tag.color}
                  size="small"
                />
              ))}
            </div>
          )}
          
          {/* Due date */}
          {card.dueDate && (
            <div className={`flex items-center gap-1 text-sm 
              ${isOverdue(card.dueDate) 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Calendar size={14} />
              <span>{formatDate(card.dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

