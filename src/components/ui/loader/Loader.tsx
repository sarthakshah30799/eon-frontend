interface LoaderProps {
  variant?: 'full' | 'inline' | 'spinner';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader = ({
  variant = 'full',
  className = '',
  size = 'md',
}: LoaderProps) => {
  if (variant === 'spinner') {
    const sizeClasses = {
      sm: 'h-3 w-3 border-2',
      md: 'h-4 w-4 border-2',
      lg: 'h-6 w-6 border-2',
    };
    return (
      <span
        className={`inline-block animate-spin rounded-full border-t-transparent border-current ${sizeClasses[size]} ${className}`}
      />
    );
  }

  if (variant === 'inline') {
    const spinnerSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
    return (
      <div className={`flex items-center justify-center py-6 ${className}`}>
        <div className="text-center">
          <div className={`animate-spin mx-auto mb-2 ${spinnerSize} rounded-full border-b-2 border-primary-500`}></div>
          <p className="text-xs text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="animate-spin mx-auto mb-4 h-8 w-8 rounded-full border-b-2 border-primary-500"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
};
