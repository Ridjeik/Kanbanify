import { Flag } from 'lucide-react';

/**
 * Priority component for displaying task priorities
 */
export default function Priority({ 
  level = 'medium', 
  showLabel = true,
  size = 'medium' 
}) {
  const priorities = {
    low: {
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      label: 'Low',
      icon: 'text-gray-500 dark:text-gray-400',
    },
    medium: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      label: 'Medium',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    high: {
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      label: 'High',
      icon: 'text-orange-600 dark:text-orange-400',
    },
    critical: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      label: 'Critical',
      icon: 'text-red-600 dark:text-red-400',
    },
  };
  
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-2.5 py-1',
  };
  
  const iconSizes = {
    small: 12,
    medium: 14,
  };
  
  const priority = priorities[level] || priorities.medium;
  
  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium 
        ${priority.color} ${sizeClasses[size]}`}
    >
      <Flag size={iconSizes[size]} className={priority.icon} />
      {showLabel && priority.label}
    </span>
  );
}

/**
 * Get all available priority levels
 */
export function getPriorityLevels() {
  return [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];
}

/**
 * Get priority order value for sorting
 */
export function getPriorityOrder(level) {
  const order = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return order[level] || 2;
}

