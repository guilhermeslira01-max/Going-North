interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      className={`block rounded-full border-2 border-brand-text3/30 border-t-brand-green animate-spin ${sizes[size]} ${className}`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner size="lg" />
    </div>
  );
}
