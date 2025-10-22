import { X } from 'lucide-react';

/**
 * Tag component for displaying labels/tags
 */
export default function Tag({ 
  label, 
  color = 'blue', 
  onRemove, 
  size = 'medium' 
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };
  
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-2.5 py-1',
  };
  
  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium 
        ${colors[color] || colors.blue} ${sizeClasses[size]}`}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${label} tag`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

/**
 * Get a random color for a tag
 */
export function getRandomTagColor() {
  const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink'];
  return colors[Math.floor(Math.random() * colors.length)];
}

