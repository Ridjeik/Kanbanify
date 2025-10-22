/**
 * Reusable IconButton component
 */
export default function IconButton({ 
  icon: Icon, 
  onClick, 
  label,
  variant = 'ghost',
  size = 'medium',
  className = '',
  ...props 
}) {
  const sizeClasses = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3',
  };
  
  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };
  
  const variantClasses = {
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400',
    danger: 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400',
  };
  
  return (
    <button
      onClick={onClick}
      className={`rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
        ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      title={label}
      aria-label={label}
      {...props}
    >
      <Icon size={iconSizes[size]} />
    </button>
  );
}

