interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  message?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const colorClasses = {
  blue: 'border-blue-500',
  green: 'border-green-500', 
  purple: 'border-purple-500',
  orange: 'border-orange-500'
};

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  message 
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div 
        className={`animate-spin rounded-full border-2 border-gray-700 ${sizeClasses[size]} ${colorClasses[color]} border-t-transparent`}
      />
      {message && (
        <p className="text-gray-400 text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}