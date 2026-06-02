import { useState } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  photoUrl: string | null | undefined;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm:  'w-8 h-8 text-sm',
  md:  'w-10 h-10 text-sm',
  lg:  'w-16 h-16 text-xl',
  xl:  'w-24 h-24 text-4xl',
};

export function UserAvatar({ photoUrl, name, size = 'md', className }: Props) {
  const [error, setError] = useState(false);
  const initial = name.charAt(0).toUpperCase();
  const dim = sizes[size];

  if (photoUrl && !error) {
    return (
      <img
        src={photoUrl}
        alt={name}
        onError={() => setError(true)}
        className={cn(dim, 'rounded-full object-cover shrink-0', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        dim,
        'rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center font-black text-white shrink-0',
        className
      )}
    >
      {initial}
    </div>
  );
}
