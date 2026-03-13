import Image from 'next/image';
import { User } from '@/lib/types';

interface Props {
  user: Partial<User>;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 32, md: 48, lg: 96 };

export function UserAvatar({ user, size = 'md' }: Props) {
  const px = sizes[size];
  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.name || 'User'}
        width={px}
        height={px}
        className="rounded-full object-cover"
        style={{ width: px, height: px }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-sky-500 flex items-center justify-center text-white font-bold"
      style={{ width: px, height: px, fontSize: px * 0.4 }}
    >
      {(user.name || 'U').charAt(0).toUpperCase()}
    </div>
  );
}
